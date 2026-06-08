"""
IOC Enrichment Service
Queries VirusTotal, AbuseIPDB, and Shodan for threat intelligence.
Falls back gracefully if API keys are not set.
"""

import re
import httpx
from typing import Dict, Any
from app.config import settings

async def _vt_lookup(ioc: str, ioc_type: str) -> Dict[str, Any]:
    """Query VirusTotal API v3."""
    if not settings.VIRUSTOTAL_API_KEY:
        return {"source": "VirusTotal", "status": "API key not configured"}

    headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
    endpoint_map = {
        "ipv4": f"https://www.virustotal.com/api/v3/ip_addresses/{ioc}",
        "domain": f"https://www.virustotal.com/api/v3/domains/{ioc}",
        "md5": f"https://www.virustotal.com/api/v3/files/{ioc}",
        "sha1": f"https://www.virustotal.com/api/v3/files/{ioc}",
        "sha256": f"https://www.virustotal.com/api/v3/files/{ioc}",
        "url": f"https://www.virustotal.com/api/v3/urls",
    }

    url = endpoint_map.get(ioc_type)
    if not url:
        return {"source": "VirusTotal", "status": "Unsupported IOC type"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            if ioc_type == "url":
                import base64
                encoded = base64.urlsafe_b64encode(ioc.encode()).decode().strip("=")
                url = f"https://www.virustotal.com/api/v3/urls/{encoded}"

            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                malicious = stats.get("malicious", 0)
                total = sum(stats.values()) if stats else 0
                return {
                    "source": "VirusTotal",
                    "malicious_detections": malicious,
                    "total_engines": total,
                    "verdict": "MALICIOUS" if malicious > 3 else ("SUSPICIOUS" if malicious > 0 else "CLEAN"),
                    "link": f"https://www.virustotal.com/gui/{'ip-address' if ioc_type == 'ipv4' else ioc_type}/{ioc}",
                    "raw_stats": stats,
                }
            elif resp.status_code == 404:
                return {"source": "VirusTotal", "verdict": "NOT_FOUND", "status": "No record found"}
            else:
                return {"source": "VirusTotal", "status": f"HTTP {resp.status_code}"}
    except Exception as e:
        return {"source": "VirusTotal", "status": f"Error: {str(e)}"}

async def _abuseipdb_lookup(ip: str) -> Dict[str, Any]:
    """Query AbuseIPDB for IP reputation."""
    if not settings.ABUSEIPDB_API_KEY:
        return {"source": "AbuseIPDB", "status": "API key not configured"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.abuseipdb.com/api/v2/check",
                params={"ipAddress": ip, "maxAgeInDays": 90, "verbose": True},
                headers={"Key": settings.ABUSEIPDB_API_KEY, "Accept": "application/json"},
            )
            if resp.status_code == 200:
                d = resp.json().get("data", {})
                score = d.get("abuseConfidenceScore", 0)
                return {
                    "source": "AbuseIPDB",
                    "abuse_confidence_score": score,
                    "total_reports": d.get("totalReports", 0),
                    "country": d.get("countryCode", "Unknown"),
                    "isp": d.get("isp", "Unknown"),
                    "usage_type": d.get("usageType", "Unknown"),
                    "verdict": "MALICIOUS" if score >= 70 else ("SUSPICIOUS" if score >= 25 else "CLEAN"),
                    "link": f"https://www.abuseipdb.com/check/{ip}",
                }
            return {"source": "AbuseIPDB", "status": f"HTTP {resp.status_code}"}
    except Exception as e:
        return {"source": "AbuseIPDB", "status": f"Error: {str(e)}"}

async def _shodan_lookup(ip: str) -> Dict[str, Any]:
    """Query Shodan for IP host information."""
    if not settings.SHODAN_API_KEY:
        return {"source": "Shodan", "status": "API key not configured"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"https://api.shodan.io/shodan/host/{ip}",
                params={"key": settings.SHODAN_API_KEY},
            )
            if resp.status_code == 200:
                d = resp.json()
                return {
                    "source": "Shodan",
                    "org": d.get("org", "Unknown"),
                    "country": d.get("country_name", "Unknown"),
                    "open_ports": d.get("ports", [])[:10],
                    "vulns": list(d.get("vulns", {}).keys())[:5],
                    "hostnames": d.get("hostnames", [])[:5],
                    "tags": d.get("tags", []),
                    "link": f"https://www.shodan.io/host/{ip}",
                }
            return {"source": "Shodan", "status": f"HTTP {resp.status_code}"}
    except Exception as e:
        return {"source": "Shodan", "status": f"Error: {str(e)}"}

def _detect_ioc_type(ioc: str) -> str:
    """Auto-detect IOC type."""
    ioc = ioc.strip()
    if re.match(r"^\b(?:\d{1,3}\.){3}\d{1,3}\b$", ioc):
        return "ipv4"
    if re.match(r"^[a-fA-F0-9]{64}$", ioc):
        return "sha256"
    if re.match(r"^[a-fA-F0-9]{40}$", ioc):
        return "sha1"
    if re.match(r"^[a-fA-F0-9]{32}$", ioc):
        return "md5"
    if re.match(r"^https?://", ioc):
        return "url"
    if re.match(r"^[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", ioc):
        return "domain"
    return "unknown"

def _aggregate_verdict(results: list) -> str:
    verdicts = [r.get("verdict") for r in results if r.get("verdict")]
    if "MALICIOUS" in verdicts:
        return "MALICIOUS"
    if "SUSPICIOUS" in verdicts:
        return "SUSPICIOUS"
    if all(v == "CLEAN" for v in verdicts if v):
        return "CLEAN"
    return "UNKNOWN"

async def enrich_ioc(ioc: str, ioc_type: str = None) -> Dict[str, Any]:
    """Run enrichment on a single IOC across all configured sources."""
    ioc = ioc.strip()
    if not ioc_type:
        ioc_type = _detect_ioc_type(ioc)

    results = []

    if ioc_type in ("ipv4",):
        vt, abuse, shodan = await asyncio.gather(
            _vt_lookup(ioc, ioc_type),
            _abuseipdb_lookup(ioc),
            _shodan_lookup(ioc),
        )
        results = [vt, abuse, shodan]

    elif ioc_type in ("domain",):
        vt = await _vt_lookup(ioc, ioc_type)
        results = [vt]

    elif ioc_type in ("md5", "sha1", "sha256"):
        vt = await _vt_lookup(ioc, ioc_type)
        results = [vt]

    elif ioc_type == "url":
        vt = await _vt_lookup(ioc, ioc_type)
        results = [vt]

    else:
        results = [{"source": "Detection", "status": "Unknown IOC type — cannot enrich automatically"}]

    verdict = _aggregate_verdict(results)
    return {
        "ioc": ioc,
        "ioc_type": ioc_type,
        "verdict": verdict,
        "sources": results,
    }

# Need asyncio for gather
import asyncio
