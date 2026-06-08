"""
Core triage engine.
Scores alert severity and generates a structured triage summary.
Works WITHOUT AI (rule-based) but upgrades to AI explanation if OpenAI key is set.
"""

import re
from typing import Dict, List
from app.services.mitre_service import map_to_mitre
from app.config import settings

# ── Severity keyword weights ─────────────────────────────────────────────────
CRITICAL_KEYWORDS = [
    "ransomware", "lsass", "mimikatz", "cobalt strike", "cobaltstrike",
    "privilege escalation", "uac bypass", "lateral movement", "data exfil",
    "reverse shell", "meterpreter", "rootkit", "wce", "pass the hash", "pth",
    "lockbit", "ryuk", "conti", "revil", "webshell", "rce",
]

HIGH_KEYWORDS = [
    "powershell", "encoded command", "base64", "process injection",
    "dll injection", "credential dump", "brute force", "port scan",
    "new user created", "scheduled task", "disable antivirus",
    "disable defender", "c2", "beaconing", "sql injection", "exploit",
    "obfuscated", "phishing", "malicious attachment",
]

MEDIUM_KEYWORDS = [
    "failed login", "authentication failure", "account lockout",
    "suspicious process", "unusual outbound", "large upload",
    "encoded payload", "network scan", "enumeration", "rdp", "psexec",
]

LOW_KEYWORDS = [
    "dns query", "http request", "file access", "login", "connection",
]

IOC_PATTERNS = {
    "ipv4": re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"),
    "domain": re.compile(r"\b(?:[a-zA-Z0-9\-]+\.)+(?:com|net|org|io|ru|cn|tk|pw|xyz|top|info|biz)\b"),
    "md5": re.compile(r"\b[a-fA-F0-9]{32}\b"),
    "sha1": re.compile(r"\b[a-fA-F0-9]{40}\b"),
    "sha256": re.compile(r"\b[a-fA-F0-9]{64}\b"),
    "url": re.compile(r"https?://[^\s]+"),
    "email": re.compile(r"\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b"),
    "cve": re.compile(r"CVE-\d{4}-\d{4,7}", re.IGNORECASE),
}

def _score_severity(alert_lower: str) -> tuple[str, int]:
    score = 0
    for kw in CRITICAL_KEYWORDS:
        if kw in alert_lower:
            score += 40
    for kw in HIGH_KEYWORDS:
        if kw in alert_lower:
            score += 15
    for kw in MEDIUM_KEYWORDS:
        if kw in alert_lower:
            score += 5
    for kw in LOW_KEYWORDS:
        if kw in alert_lower:
            score += 1

    if score >= 40:
        return "CRITICAL", score
    elif score >= 20:
        return "HIGH", score
    elif score >= 8:
        return "MEDIUM", score
    elif score >= 2:
        return "LOW", score
    else:
        return "INFORMATIONAL", score

def _extract_iocs(alert_text: str) -> Dict[str, List[str]]:
    iocs: Dict[str, List[str]] = {}
    for ioc_type, pattern in IOC_PATTERNS.items():
        matches = list(set(pattern.findall(alert_text)))
        if matches:
            # filter out obvious false-positives for IPs (localhost etc.)
            if ioc_type == "ipv4":
                matches = [m for m in matches if not m.startswith("127.") and not m.startswith("0.0.0.0")]
            iocs[ioc_type] = matches
    return iocs

def _rule_based_summary(alert_text: str, severity: str, mitre: List[Dict], iocs: Dict) -> str:
    lines = []
    lines.append(f"Severity Assessment: {severity}")
    lines.append("")

    if mitre:
        lines.append("Detected Tactics & Techniques:")
        for t in mitre:
            lines.append(f"  • [{t['id']}] {t['name']} — {t['tactic']}")
            lines.append(f"    Triggered by keyword: '{t['matched_keyword']}'")
    else:
        lines.append("No specific ATT&CK techniques matched. Manual review recommended.")

    lines.append("")
    if iocs:
        lines.append("Extracted Indicators of Compromise (IOCs):")
        for ioc_type, values in iocs.items():
            lines.append(f"  • {ioc_type.upper()}: {', '.join(values[:5])}")
    else:
        lines.append("No IOCs automatically extracted.")

    lines.append("")
    lines.append("Recommended Immediate Actions:")
    if severity in ("CRITICAL", "HIGH"):
        lines.append("  1. Isolate the affected host from the network immediately.")
        lines.append("  2. Preserve memory dump and disk image before remediation.")
        lines.append("  3. Escalate to Tier 2/3 analyst and Incident Response team.")
        lines.append("  4. Enrich all extracted IOCs against threat intel feeds.")
        lines.append("  5. Check for lateral movement to adjacent systems.")
    elif severity == "MEDIUM":
        lines.append("  1. Investigate the source process and parent process tree.")
        lines.append("  2. Review recent user activity on the affected host.")
        lines.append("  3. Correlate with other alerts in the same timeframe.")
        lines.append("  4. Enrich IOCs and check threat intelligence.")
    else:
        lines.append("  1. Log and monitor — likely low priority but keep an eye on it.")
        lines.append("  2. Correlate with other events from the same source.")

    return "\n".join(lines)

async def triage_alert(alert_text: str) -> Dict:
    alert_lower = alert_text.lower()
    severity, score = _score_severity(alert_lower)
    mitre_techniques = map_to_mitre(alert_text)
    iocs = _extract_iocs(alert_text)

    summary = _rule_based_summary(alert_text, severity, mitre_techniques, iocs)

    # If OpenAI key is present, enrich summary with AI explanation
    ai_explanation = None
    if settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            prompt = f"""You are a senior SOC analyst. Analyze this security alert and provide:
1. A brief plain-English explanation of what is happening (2-3 sentences, beginner-friendly)
2. The most likely attack scenario
3. Top 3 investigation steps

Alert:
{alert_text[:3000]}

Keep your response concise and practical. Use SOC analyst terminology."""

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.3,
            )
            ai_explanation = response.choices[0].message.content
        except Exception:
            ai_explanation = None

    return {
        "severity": severity,
        "risk_score": score,
        "mitre_techniques": mitre_techniques,
        "iocs": iocs,
        "triage_summary": summary,
        "ai_explanation": ai_explanation,
    }
