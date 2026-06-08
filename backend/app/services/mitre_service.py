"""
MITRE ATT&CK mapping service.
Uses a curated keyword->technique map derived from the public ATT&CK dataset.
No external API call needed — works fully offline.
"""

from typing import List, Dict

# Curated subset of ATT&CK Enterprise techniques most relevant to SOC alert types
TECHNIQUE_MAP: List[Dict] = [
    {
        "id": "T1059",
        "name": "Command and Scripting Interpreter",
        "tactic": "Execution",
        "keywords": ["powershell", "cmd.exe", "bash", "wscript", "cscript", "script", "invoke-expression", "iex", "encoded command", "base64"],
        "url": "https://attack.mitre.org/techniques/T1059/",
        "description": "Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries."
    },
    {
        "id": "T1055",
        "name": "Process Injection",
        "tactic": "Defense Evasion / Privilege Escalation",
        "keywords": ["injection", "virtualalloc", "writeprocessmemory", "createremotethread", "dll injection", "hollowing", "process hollowing"],
        "url": "https://attack.mitre.org/techniques/T1055/",
        "description": "Adversaries may inject code into processes to evade process-based defenses."
    },
    {
        "id": "T1003",
        "name": "OS Credential Dumping",
        "tactic": "Credential Access",
        "keywords": ["lsass", "mimikatz", "credential dump", "sekurlsa", "ntds", "sam database", "hashdump", "procdump", "wce"],
        "url": "https://attack.mitre.org/techniques/T1003/",
        "description": "Adversaries may attempt to dump credentials to obtain account login information."
    },
    {
        "id": "T1078",
        "name": "Valid Accounts",
        "tactic": "Defense Evasion / Persistence",
        "keywords": ["valid account", "legitimate credential", "stolen credential", "account abuse", "logon with valid", "pass the hash", "pth"],
        "url": "https://attack.mitre.org/techniques/T1078/",
        "description": "Adversaries may obtain and abuse credentials of existing accounts."
    },
    {
        "id": "T1190",
        "name": "Exploit Public-Facing Application",
        "tactic": "Initial Access",
        "keywords": ["sql injection", "sqli", "rce", "remote code execution", "exploit", "vulnerability", "cve", "webshell", "web shell", "lfi", "rfi", "file inclusion"],
        "url": "https://attack.mitre.org/techniques/T1190/",
        "description": "Adversaries may attempt to exploit a weakness in an Internet-facing host or system."
    },
    {
        "id": "T1566",
        "name": "Phishing",
        "tactic": "Initial Access",
        "keywords": ["phishing", "spear phishing", "malicious attachment", "malicious link", "suspicious email", "macro", "office macro", "docm", "xlsm"],
        "url": "https://attack.mitre.org/techniques/T1566/",
        "description": "Adversaries may send phishing messages to gain access to victim systems."
    },
    {
        "id": "T1021",
        "name": "Remote Services",
        "tactic": "Lateral Movement",
        "keywords": ["rdp", "ssh", "smb", "lateral movement", "remote desktop", "psexec", "wmi", "winrm", "remote service"],
        "url": "https://attack.mitre.org/techniques/T1021/",
        "description": "Adversaries may use remote services to move laterally through the network."
    },
    {
        "id": "T1071",
        "name": "Application Layer Protocol",
        "tactic": "Command and Control",
        "keywords": ["c2", "c&c", "command and control", "beaconing", "beacon", "cobaltstrike", "cobalt strike", "metasploit", "dns tunneling", "http tunnel"],
        "url": "https://attack.mitre.org/techniques/T1071/",
        "description": "Adversaries may communicate using application layer protocols to avoid detection."
    },
    {
        "id": "T1486",
        "name": "Data Encrypted for Impact",
        "tactic": "Impact",
        "keywords": ["ransomware", "encrypted files", "ransom note", ".locked", ".enc", "decrypt", "lockbit", "ryuk", "conti", "revil", "file encryption"],
        "url": "https://attack.mitre.org/techniques/T1486/",
        "description": "Adversaries may encrypt data on target systems to interrupt availability."
    },
    {
        "id": "T1041",
        "name": "Exfiltration Over C2 Channel",
        "tactic": "Exfiltration",
        "keywords": ["exfiltration", "data exfil", "data theft", "sensitive data upload", "outbound transfer", "large upload"],
        "url": "https://attack.mitre.org/techniques/T1041/",
        "description": "Adversaries may steal data by exfiltrating it over an existing C2 channel."
    },
    {
        "id": "T1548",
        "name": "Abuse Elevation Control Mechanism",
        "tactic": "Privilege Escalation",
        "keywords": ["uac bypass", "privilege escalation", "sudo abuse", "setuid", "elevation", "escalate privileges"],
        "url": "https://attack.mitre.org/techniques/T1548/",
        "description": "Adversaries may attempt to bypass mechanisms designed to control elevated privileges."
    },
    {
        "id": "T1562",
        "name": "Impair Defenses",
        "tactic": "Defense Evasion",
        "keywords": ["disable antivirus", "disable firewall", "kill av", "tamper with logs", "clear logs", "wevtutil", "disable defender", "disable logging"],
        "url": "https://attack.mitre.org/techniques/T1562/",
        "description": "Adversaries may maliciously modify components of a victim environment to impair defenses."
    },
    {
        "id": "T1136",
        "name": "Create Account",
        "tactic": "Persistence",
        "keywords": ["new user created", "net user /add", "useradd", "adduser", "account creation", "created local account", "backdoor account"],
        "url": "https://attack.mitre.org/techniques/T1136/",
        "description": "Adversaries may create an account to maintain access to victim systems."
    },
    {
        "id": "T1053",
        "name": "Scheduled Task / Job",
        "tactic": "Persistence / Execution",
        "keywords": ["scheduled task", "crontab", "schtasks", "at command", "persistence via task", "cron job"],
        "url": "https://attack.mitre.org/techniques/T1053/",
        "description": "Adversaries may abuse task scheduling functionality to facilitate persistence."
    },
    {
        "id": "T1110",
        "name": "Brute Force",
        "tactic": "Credential Access",
        "keywords": ["brute force", "password spray", "multiple failed login", "authentication failure", "login attempts", "failed authentication", "account lockout"],
        "url": "https://attack.mitre.org/techniques/T1110/",
        "description": "Adversaries may use brute force to gain access to accounts."
    },
    {
        "id": "T1046",
        "name": "Network Service Discovery",
        "tactic": "Discovery",
        "keywords": ["port scan", "nmap", "network scan", "service enumeration", "masscan", "scanning", "host discovery"],
        "url": "https://attack.mitre.org/techniques/T1046/",
        "description": "Adversaries may attempt to get a listing of services running on remote hosts."
    },
    {
        "id": "T1027",
        "name": "Obfuscated Files or Information",
        "tactic": "Defense Evasion",
        "keywords": ["obfuscated", "encoded payload", "base64 encoded", "xor encoded", "packed binary", "obfuscation", "encrypted payload"],
        "url": "https://attack.mitre.org/techniques/T1027/",
        "description": "Adversaries may attempt to make an executable or file difficult to discover or analyze."
    },
    {
        "id": "T1204",
        "name": "User Execution",
        "tactic": "Execution",
        "keywords": ["user clicked", "user opened", "malicious file executed", "user execution", "double clicked", "opened attachment"],
        "url": "https://attack.mitre.org/techniques/T1204/",
        "description": "An adversary may rely upon specific actions by a user to gain execution."
    },
]

def map_to_mitre(alert_text: str) -> List[Dict]:
    """Return matching ATT&CK techniques based on keywords found in alert text."""
    alert_lower = alert_text.lower()
    matched = []
    seen_ids = set()

    for technique in TECHNIQUE_MAP:
        for keyword in technique["keywords"]:
            if keyword in alert_lower and technique["id"] not in seen_ids:
                matched.append({
                    "id": technique["id"],
                    "name": technique["name"],
                    "tactic": technique["tactic"],
                    "url": technique["url"],
                    "description": technique["description"],
                    "matched_keyword": keyword,
                })
                seen_ids.add(technique["id"])
                break

    return matched
