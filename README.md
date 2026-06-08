# 🛡️ SOC Copilot — AI-Powered Analyst Workbench

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square&logo=shield" />
  <img src="https://img.shields.io/badge/Python-3.12-green?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/MITRE%20ATT%26CK-Mapped-red?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square" />
</p>

> **SOC Copilot** is an open-source SaaS workbench built for junior SOC analysts.
> Triage raw alerts, get MITRE ATT&CK mappings, generate investigation playbooks, and enrich IOCs — all in one dark-mode terminal-style UI.

---

## 🎯 Why SOC Copilot?

Junior SOC analysts deal with **500+ alerts per day**, 60% of which are false positives. They don't always know what to investigate first, which MITRE technique applies, or what steps to take.

SOC Copilot solves exactly that:

| Problem | SOC Copilot Solution |
|---|---|
| Alert fatigue / where to start | Severity scoring engine (CRITICAL → INFORMATIONAL) |
| What MITRE technique is this? | Automatic ATT&CK mapping, no manual lookup |
| How do I investigate this? | Phase-by-phase playbooks (DETECT → RECOVER) |
| Is this IP/hash malicious? | VirusTotal + AbuseIPDB + Shodan enrichment |
| How do I track my investigations? | Built-in case manager with notes |

---

## ✨ Features

### 🔴 Alert Triage Engine
- Paste any raw alert: Windows Event Log, Syslog, CEF, EDR output, free-text
- Instant severity scoring: **CRITICAL / HIGH / MEDIUM / LOW / INFORMATIONAL**
- IOC auto-extraction: IPv4, domains, hashes (MD5/SHA1/SHA256), URLs, CVEs, emails
- Optional GPT-4o-mini AI explanation (junior-friendly plain English)

### 🟠 MITRE ATT&CK Auto-Mapper
- Keyword-based mapping to MITRE Enterprise ATT&CK techniques
- Covers 18+ techniques across all major tactics
- Direct links to attack.mitre.org for each technique
- Works **fully offline** — no external API needed

### 🟡 Guided Investigation Playbooks
- 6 specialized playbooks: Ransomware, Phishing, Brute Force, Malware, Lateral Movement, C2 Beaconing
- Phase-tagged steps: `DETECT` → `INVESTIGATE` → `CONTAIN` → `ERADICATE` → `RECOVER` → `POST-INCIDENT`
- Recommended tools listed per playbook
- Auto-selected based on alert content or MITRE technique

### 🟢 IOC Enrichment
- **VirusTotal** — detection ratio across 70+ AV engines
- **AbuseIPDB** — IP abuse confidence score & reports
- **Shodan** — open ports, vulnerabilities, organization info
- Supports: IPv4, Domain, MD5, SHA1, SHA256, URL
- Lookup history panel for session reference

### 🔵 Case Manager
- Save triage results as tracked investigation cases
- Update status: OPEN / IN PROGRESS / CLOSED
- Add investigation notes per case
- Filter by severity (CRITICAL, HIGH) or status

---

## 🖥️ Screenshots

> Add screenshots here after running the project

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/YOUR_USERNAME/soc-copilot.git
cd soc-copilot

# Configure API keys
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Start everything
docker-compose up --build
```

Open: http://localhost:5173

---

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Add your API keys
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## ⚙️ Configuration

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
SECRET_KEY=your-random-secret-key

# Optional — app works without these, enrichment will show "API key not configured"
VIRUSTOTAL_API_KEY=    # Free at virustotal.com
ABUSEIPDB_API_KEY=     # Free at abuseipdb.com
SHODAN_API_KEY=        # Free at shodan.io

# Optional — enables AI analysis tab in triage
OPENAI_API_KEY=        # platform.openai.com
```

> **The app is fully functional without any API keys.** Rule-based triage, MITRE mapping, and playbooks work out of the box.

---

## 🏗️ Architecture

```
soc-copilot/
├── backend/                    # Python FastAPI
│   ├── main.py                 # App entry point
│   ├── app/
│   │   ├── config.py           # Settings / env
│   │   ├── database.py         # SQLite async ORM
│   │   ├── models.py           # User, Case, IOCResult
│   │   ├── auth.py             # JWT authentication
│   │   ├── routers/
│   │   │   ├── auth.py         # /api/auth/*
│   │   │   ├── triage.py       # /api/triage
│   │   │   ├── cases.py        # /api/cases/*
│   │   │   ├── enrichment.py   # /api/enrich
│   │   │   └── dashboard.py    # /api/dashboard/stats
│   │   └── services/
│   │       ├── triage_service.py    # Severity scoring + IOC extraction
│   │       ├── mitre_service.py     # ATT&CK keyword mapping
│   │       ├── playbook_service.py  # Playbook selection + content
│   │       └── enrichment_service.py # VT + AbuseIPDB + Shodan
├── frontend/                   # React 18 + Vite + TailwindCSS
│   └── src/
│       ├── pages/              # Dashboard, Triage, Cases, Enrichment
│       └── components/         # Layout, SeverityBadge
└── docker-compose.yml
```

---

## 🔌 API Reference

The REST API is documented via Swagger UI at: **http://localhost:8000/docs**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create analyst account |
| POST | `/api/auth/login` | Get JWT token |
| POST | `/api/triage` | Analyze raw alert |
| GET | `/api/cases` | List all cases |
| POST | `/api/cases` | Create case from alert |
| PATCH | `/api/cases/{id}` | Update case status/notes |
| POST | `/api/enrich` | Enrich IOC |
| GET | `/api/dashboard/stats` | Analyst stats |

---

## 🛡️ MITRE ATT&CK Coverage

| Technique ID | Name | Tactic |
|---|---|---|
| T1059 | Command and Scripting Interpreter | Execution |
| T1055 | Process Injection | Defense Evasion |
| T1003 | OS Credential Dumping | Credential Access |
| T1078 | Valid Accounts | Persistence |
| T1190 | Exploit Public-Facing Application | Initial Access |
| T1566 | Phishing | Initial Access |
| T1021 | Remote Services | Lateral Movement |
| T1071 | Application Layer Protocol | C2 |
| T1486 | Data Encrypted for Impact | Impact |
| T1110 | Brute Force | Credential Access |
| T1046 | Network Service Discovery | Discovery |
| T1562 | Impair Defenses | Defense Evasion |
| T1136 | Create Account | Persistence |
| T1053 | Scheduled Task / Job | Persistence |
| T1041 | Exfiltration Over C2 Channel | Exfiltration |
| T1027 | Obfuscated Files or Information | Defense Evasion |
| T1204 | User Execution | Execution |
| T1548 | Abuse Elevation Control Mechanism | Privilege Escalation |

---

## 🔮 Roadmap

- [ ] SIGMA rule generation from alerts
- [ ] TheHive / MISP integration
- [ ] Wazuh/Elastic alert ingestion webhook
- [ ] PDF incident report export
- [ ] Multi-analyst team support
- [ ] Alert correlation engine

---

## 🤝 Contributing

PRs welcome. If you're a SOC analyst and find a missing playbook or technique, open an issue.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 📚 Resources

- [MITRE ATT&CK Framework](https://attack.mitre.org)
- [VirusTotal API Docs](https://developers.virustotal.com)
- [AbuseIPDB API](https://www.abuseipdb.com/api)
- [Shodan API](https://developer.shodan.io)
- [NIST Incident Response Guide](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf)

---

<p align="center">Built for the SOC community 🛡️</p>
