"""
Playbook generator.
Returns step-by-step investigation & response playbooks based on alert type.
"""

from typing import Dict, List

PLAYBOOKS: Dict[str, Dict] = {
    "ransomware": {
        "title": "Ransomware Incident Response Playbook",
        "severity": "CRITICAL",
        "steps": [
            {"phase": "DETECT", "action": "Confirm ransomware activity — check for mass file encryption, ransom notes (.txt/.html), changed file extensions."},
            {"phase": "CONTAIN", "action": "Immediately isolate affected hosts by disabling network adapters or VLAN isolation. Do NOT reboot."},
            {"phase": "CONTAIN", "action": "Identify patient-zero — first infected host. Review EDR/SIEM for initial execution vector."},
            {"phase": "CONTAIN", "action": "Disable shared drives and network shares that may be affected."},
            {"phase": "INVESTIGATE", "action": "Collect memory dump from affected hosts before any remediation."},
            {"phase": "INVESTIGATE", "action": "Identify the ransomware family using samples + VirusTotal or ID Ransomware (https://id-ransomware.malwarehunterteam.com/)."},
            {"phase": "INVESTIGATE", "action": "Map attack timeline: initial access → execution → lateral movement → encryption."},
            {"phase": "INVESTIGATE", "action": "Check backup systems for integrity — ensure backups are not encrypted or deleted."},
            {"phase": "ERADICATE", "action": "Remove ransomware binaries and persistence mechanisms (scheduled tasks, registry run keys)."},
            {"phase": "RECOVER", "action": "Restore from clean backups after verifying they are unaffected."},
            {"phase": "RECOVER", "action": "Reset all credentials, especially privileged accounts and service accounts."},
            {"phase": "POST-INCIDENT", "action": "Document full attack timeline and write lessons-learned report."},
            {"phase": "POST-INCIDENT", "action": "Patch the exploited vulnerability or close the initial access vector."},
        ],
        "tools": ["VirusTotal", "ID Ransomware", "Velociraptor", "Volatility", "CyberChef"],
        "mitre_ref": ["T1486", "T1490", "T1021", "T1078"],
    },
    "phishing": {
        "title": "Phishing / Spear-Phishing Investigation Playbook",
        "severity": "HIGH",
        "steps": [
            {"phase": "DETECT", "action": "Obtain the original email with full headers. Do NOT click any links."},
            {"phase": "DETECT", "action": "Identify sender address, reply-to, and originating IP from email headers."},
            {"phase": "INVESTIGATE", "action": "Check sender domain age and reputation using WHOIS and VirusTotal."},
            {"phase": "INVESTIGATE", "action": "Detonate any attachments in an isolated sandbox (Any.run, Cuckoo)."},
            {"phase": "INVESTIGATE", "action": "Check all URLs in the email using URLScan.io and VirusTotal."},
            {"phase": "INVESTIGATE", "action": "Identify all recipients of the phishing email — check if anyone clicked."},
            {"phase": "INVESTIGATE", "action": "Review proxy/web filter logs for any connections to phishing domain."},
            {"phase": "CONTAIN", "action": "Block sender domain and phishing URLs at email gateway and web proxy."},
            {"phase": "CONTAIN", "action": "If user clicked: isolate host, reset credentials, review for credential theft."},
            {"phase": "ERADICATE", "action": "Delete phishing emails from all affected mailboxes."},
            {"phase": "RECOVER", "action": "Reset compromised user credentials and enable MFA if not present."},
            {"phase": "POST-INCIDENT", "action": "Report phishing domain to hosting provider and abuse contacts."},
        ],
        "tools": ["MxToolbox", "URLScan.io", "Any.run", "VirusTotal", "PhishTank"],
        "mitre_ref": ["T1566", "T1204", "T1078"],
    },
    "brute_force": {
        "title": "Brute Force / Credential Attack Playbook",
        "severity": "HIGH",
        "steps": [
            {"phase": "DETECT", "action": "Identify affected accounts and source IPs from failed login logs."},
            {"phase": "DETECT", "action": "Determine attack type: password spray (many accounts, few attempts) or brute force (one account, many attempts)."},
            {"phase": "INVESTIGATE", "action": "Check if any accounts were successfully compromised (successful login after failures)."},
            {"phase": "INVESTIGATE", "action": "Enrich source IP(s) against AbuseIPDB and VirusTotal."},
            {"phase": "INVESTIGATE", "action": "Review what the source IP/attacker did after any successful authentication."},
            {"phase": "CONTAIN", "action": "Block attacking IP(s) at perimeter firewall or WAF."},
            {"phase": "CONTAIN", "action": "Lock or disable compromised accounts immediately."},
            {"phase": "CONTAIN", "action": "Enable account lockout policy if not already configured."},
            {"phase": "ERADICATE", "action": "Reset passwords for all targeted accounts (not just compromised ones)."},
            {"phase": "RECOVER", "action": "Enable MFA on all affected accounts."},
            {"phase": "POST-INCIDENT", "action": "Review authentication logs for successful logins from the attacking IP."},
        ],
        "tools": ["AbuseIPDB", "VirusTotal", "Shodan", "SIEM/Splunk", "Active Directory Logs"],
        "mitre_ref": ["T1110", "T1078", "T1021"],
    },
    "malware": {
        "title": "Malware Infection Investigation Playbook",
        "severity": "HIGH",
        "steps": [
            {"phase": "DETECT", "action": "Identify the malicious process name, PID, parent process, and file path."},
            {"phase": "DETECT", "action": "Collect file hash (MD5/SHA256) of the suspicious binary."},
            {"phase": "INVESTIGATE", "action": "Submit file hash to VirusTotal — check detection ratio and known family."},
            {"phase": "INVESTIGATE", "action": "Review process tree: how was this process spawned? What spawned it?"},
            {"phase": "INVESTIGATE", "action": "Check for persistence: registry run keys, startup folder, scheduled tasks, services."},
            {"phase": "INVESTIGATE", "action": "Review network connections made by the process (C2, beaconing patterns)."},
            {"phase": "INVESTIGATE", "action": "Check for credential access activity (LSASS access, browser data theft)."},
            {"phase": "CONTAIN", "action": "Isolate the affected host from the network."},
            {"phase": "CONTAIN", "action": "Kill the malicious process and quarantine the file."},
            {"phase": "ERADICATE", "action": "Remove all persistence mechanisms identified."},
            {"phase": "ERADICATE", "action": "Scan for additional infected hosts using file hash or C2 IOCs across SIEM."},
            {"phase": "RECOVER", "action": "Rebuild host if full rootkit/implant activity confirmed."},
        ],
        "tools": ["VirusTotal", "Any.run", "Sysinternals", "Volatility", "CyberChef", "YARA"],
        "mitre_ref": ["T1055", "T1059", "T1071", "T1562"],
    },
    "lateral_movement": {
        "title": "Lateral Movement Detection Playbook",
        "severity": "CRITICAL",
        "steps": [
            {"phase": "DETECT", "action": "Identify source and destination hosts in the lateral movement chain."},
            {"phase": "DETECT", "action": "Determine the technique used: PsExec, RDP, WMI, SMB, Pass-the-Hash, etc."},
            {"phase": "INVESTIGATE", "action": "Map the full movement path — which hosts were accessed and in what order."},
            {"phase": "INVESTIGATE", "action": "Identify the credentials used — are they domain admin or service accounts?"},
            {"phase": "INVESTIGATE", "action": "Check for data access or staging activity on pivoted hosts."},
            {"phase": "CONTAIN", "action": "Isolate all hosts in the movement chain simultaneously."},
            {"phase": "CONTAIN", "action": "Reset all credentials used in the lateral movement immediately."},
            {"phase": "CONTAIN", "action": "Block the source IP or workstation from accessing other network segments."},
            {"phase": "ERADICATE", "action": "Remove any persistence mechanisms or implants dropped during movement."},
            {"phase": "RECOVER", "action": "Audit all affected systems and rebuild compromised hosts."},
            {"phase": "POST-INCIDENT", "action": "Implement network segmentation to prevent future lateral movement."},
        ],
        "tools": ["Velociraptor", "CrowdStrike Falcon", "Sysmon", "Zeek", "BloodHound"],
        "mitre_ref": ["T1021", "T1078", "T1550", "T1570"],
    },
    "c2": {
        "title": "Command & Control (C2) Beaconing Playbook",
        "severity": "CRITICAL",
        "steps": [
            {"phase": "DETECT", "action": "Identify the beaconing host, destination IP/domain, interval, and beacon size."},
            {"phase": "DETECT", "action": "Analyze beacon pattern: regular interval = likely automated C2."},
            {"phase": "INVESTIGATE", "action": "Enrich C2 IP/domain against VirusTotal, AbuseIPDB, Shodan, Threat Fox."},
            {"phase": "INVESTIGATE", "action": "Identify the process responsible for the outbound connection."},
            {"phase": "INVESTIGATE", "action": "Check for known C2 frameworks: Cobalt Strike (port 443/80), Metasploit, Sliver, Havoc."},
            {"phase": "INVESTIGATE", "action": "Review what data (if any) has been exfiltrated via C2 channel."},
            {"phase": "CONTAIN", "action": "Block C2 IP/domain at firewall and DNS immediately."},
            {"phase": "CONTAIN", "action": "Isolate the beaconing host from the network."},
            {"phase": "ERADICATE", "action": "Identify and remove the implant/RAT responsible for beaconing."},
            {"phase": "ERADICATE", "action": "Hunt for similar IOCs across all endpoints using EDR/SIEM."},
            {"phase": "RECOVER", "action": "Rebuild compromised host. C2 presence = assume full compromise."},
        ],
        "tools": ["Wireshark", "Zeek", "VirusTotal", "Shodan", "ThreatFox", "JA3 fingerprinting"],
        "mitre_ref": ["T1071", "T1041", "T1573", "T1095"],
    },
    "default": {
        "title": "Generic Security Alert Investigation Playbook",
        "severity": "MEDIUM",
        "steps": [
            {"phase": "DETECT", "action": "Understand the alert: what triggered it, on which system, at what time."},
            {"phase": "INVESTIGATE", "action": "Identify the user and process associated with the alert."},
            {"phase": "INVESTIGATE", "action": "Extract all IOCs: IPs, domains, file hashes, URLs, email addresses."},
            {"phase": "INVESTIGATE", "action": "Enrich IOCs against VirusTotal, AbuseIPDB, and threat intelligence platforms."},
            {"phase": "INVESTIGATE", "action": "Correlate this alert with other events on the same host in the same timeframe."},
            {"phase": "INVESTIGATE", "action": "Review the parent process tree and spawned child processes."},
            {"phase": "CONTAIN", "action": "If confirmed malicious: isolate host and preserve evidence."},
            {"phase": "ERADICATE", "action": "Remove malicious artifacts and persistence mechanisms."},
            {"phase": "RECOVER", "action": "Restore to known-good state and monitor for re-infection."},
            {"phase": "POST-INCIDENT", "action": "Document findings and update detection rules to catch future similar activity."},
        ],
        "tools": ["VirusTotal", "AbuseIPDB", "CyberChef", "SIEM", "EDR Platform"],
        "mitre_ref": [],
    }
}

def get_playbook(alert_text: str, mitre_techniques: list) -> Dict:
    """Select the most relevant playbook based on alert content."""
    alert_lower = alert_text.lower()

    if any(k in alert_lower for k in ["ransomware", "lockbit", "ryuk", "conti", "revil", "encrypted files", "ransom"]):
        return PLAYBOOKS["ransomware"]
    if any(k in alert_lower for k in ["phishing", "spear phishing", "malicious email", "suspicious email", "macro", "docm"]):
        return PLAYBOOKS["phishing"]
    if any(k in alert_lower for k in ["brute force", "password spray", "multiple failed login", "account lockout", "authentication failure"]):
        return PLAYBOOKS["brute_force"]
    if any(k in alert_lower for k in ["c2", "beaconing", "cobalt strike", "cobaltstrike", "command and control", "beacon", "meterpreter"]):
        return PLAYBOOKS["c2"]
    if any(k in alert_lower for k in ["lateral movement", "psexec", "pass the hash", "pth", "wmi exec", "remote execution"]):
        return PLAYBOOKS["lateral_movement"]
    if any(k in alert_lower for k in ["malware", "trojan", "backdoor", "rat ", "rootkit", "lsass", "mimikatz", "dll injection"]):
        return PLAYBOOKS["malware"]

    # Fall back to MITRE-based selection
    mitre_ids = [t["id"] for t in mitre_techniques]
    if "T1486" in mitre_ids:
        return PLAYBOOKS["ransomware"]
    if "T1566" in mitre_ids:
        return PLAYBOOKS["phishing"]
    if "T1110" in mitre_ids:
        return PLAYBOOKS["brute_force"]
    if "T1071" in mitre_ids:
        return PLAYBOOKS["c2"]
    if "T1021" in mitre_ids:
        return PLAYBOOKS["lateral_movement"]

    return PLAYBOOKS["default"]
