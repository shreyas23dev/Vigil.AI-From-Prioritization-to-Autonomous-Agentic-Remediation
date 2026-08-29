# 🛡️ Project Documentation — ThreatLens.AI
## **HackMatrix 2026 — Round 2 Submission**

---

## 👥 1. Team & Project Information

| Field | Details |
| :--- | :--- |
| **Team Name** | **Stratos** |
| **Team Leader Name** | **Shreyas A** |
| **Team Leader Contact** | **Email:** `shreyas.a@threatlens.io` \| **GitHub:** [@shreyas23dev](https://github.com/shreyas23dev) |
| **Team Members** | • **Shreyas A** (Team Leader — *Architecture, Scoring Engine & AI Integration*)<br>• **Trinath Bhattacharya** (*Backend API, ML CVSS Vector Imputer, Ingestion Telemetry*)<br>• **Vinod Gowda** (*Frontend Dashboard, MITRE Heatmap & ThreatEngine UI*)<br>• **Samruddhi V Achar** (*Executive PDF Report Builder, Data Feeds & IAM Governance*) |
| **Event Name** | **HackMatrix 2026 - Round 2** |
| **Selected Track** | **🤖 AI & Machine Learning** (*Intelligent solutions using AI, ML, automation, predictive analytics & autonomous agents*) |
| **Project Title** | **ThreatLens.AI** (*Adaptive Vulnerability Prioritization Engine & Cyber Threat Intelligence Command Center*) |

---

## 🔗 2. Project Links

* **GitHub Repository Link (Public)**: [https://github.com/shreyas23dev/ThreatLensAI-HackMatrix2026.git](https://github.com/shreyas23dev/ThreatLensAI-HackMatrix2026.git)
* **Demo Video Link**: [ThreatLens.AI System Walkthrough & Demo](https://youtu.be/threatlens-ai-hackmatrix2026-demo)

---

## 🖥️ 3. Platform Preview

![ThreatLens.AI Platform Preview](./docs/platform_preview.png)
*Figure 1: ThreatLens.AI Command Center Dashboard showcasing real-time PSSS queue prioritization, fleet vulnerability inspection matrix, EPSS exploit likelihood telemetry, and Sentinel AI copilot.*

---

## 📋 4. Executive Summary

**ThreatLens.AI** is an enterprise-grade cyber threat intelligence command center and adaptive vulnerability prioritization engine. Designed for Security Operations Centers (SOCs), incident response units, and CISOs, ThreatLens.AI transforms raw vulnerability feeds into prioritized, contextualized, and actionable remediation workflows.

By combining the **Predictive Security Severity Score (PSSS)** algorithm, an autonomous dual-engine **Sentinel AI Agent** with real-time tool calling, a machine-learning-based **CVSS Vector Imputer**, and interactive **MITRE ATT&CK Heatmaps**, ThreatLens.AI enables security teams to identify, triage, and remediate high-risk zero-days and active campaigns before adversaries can weaponize them.

---

## 🚨 5. Problem Statement & Problem Being Solved

### The Crisis in Modern Vulnerability Management:
1. **Alert Fatigue & Overwhelming Backlog**: With over 30,000+ new Common Vulnerabilities and Exposures (CVEs) published annually, security teams cannot remediate everything. Analysts spend hundreds of manual hours triaging alerts without understanding which flaws pose existential business risk.
2. **The Flaw of Static CVSS Scores**: Traditional Common Vulnerability Scoring System (CVSS) metrics measure theoretical technical severity in isolation. A CVSS 9.8 vulnerability with zero in-the-wild exploit availability frequently distracts teams from a CVSS 7.2 vulnerability actively weaponized by ransomware cartels.
3. **Siloed Threat Intelligence**: Real-world exploit probability data (**FIRST EPSS**), adversary tactics (**MITRE ATT&CK**), and active **Advanced Persistent Threat (APT)** actor campaigns exist in fragmented silos, disconnected from daily triage queues.
4. **Zero-Day Telemetry Gaps**: Newly disclosed zero-day vulnerabilities often lack official CVSS vector strings for days or weeks, stalling automated remediation pipelines.
5. **Slow Manual Remediation**: Bridging the gap from identification to ticket dispatch (Jira/ServiceNow) or mitigation command execution takes hours of disjointed human effort.

---

## 💎 6. Unique Selling Proposition (USP)

1. **Adaptive PSSS Scoring Engine**: Replaces static CVSS triage with a unified formula dynamically weighting base severity (CVSS), real-world exploit probability (EPSS), adversary tactic criticality (MITRE ATT&CK), and active APT threat actor multipliers:
   $$\text{PSSS} = \min\left(10.0, \max\left(0.0, \left(\alpha \cdot \frac{\text{CVSS}_{\text{base}}}{10.0} + \beta \cdot \text{EPSS} + \gamma \cdot \text{Criticality}_{\text{MITRE}}\right) \times 10.0 \times \mu\right)\right)$$
2. **Autonomous Sentinel AI Copilot with Function Calling**: An intelligent multi-LLM assistant (supporting **Google Gemini** and local/offline **Ollama** models) capable of executing real-time backend tool calls—fetching telemetry, recalculating risk weights, modifying vulnerability statuses, and predicting missing vectors.
3. **ML-Powered Zero-Day Vector Imputer**: Built-in NLP/ML pipeline (**TF-IDF + Logistic Regression**) that analyzes raw vulnerability text descriptions and predicts all 8 CVSS v3.1 vector metrics (`AV`, `AC`, `PR`, `UI`, `S`, `C`, `I`, `A`) on the fly when official scores are missing.
4. **Interactive Seaborn Heatmap & Attack Surface Intelligence**: Multi-palette MITRE ATT&CK heatmaps (`YlOrRd`, `Viridis`, `Magma`, `Rocket`, `Coolwarm`), CIA Triad impact distributions, and actor dossiers with one-click IOC clipboard integration.
5. **Executive-Ready Dark & Print PDF Reporting**: Generates formatted, C-suite-ready intelligence briefs with full print stylesheets (`window.print()`) and configurable compliance sections.

---

## ✨ 7. Key Features

### 🎛️ 1. Vulnerability Command Center (The Triage Plane)
* **Syncable Telemetry Queue**: Live queue with initial unprioritized state and one-click instant PSSS prioritization.
* **Granular Multi-Filter Engine**: Filter by lifecycle status (`UNASSIGNED`, `IN_TRIAGE`, `REMEDIATION_PENDING`, `SUPPRESSED`, `REMEDIATED`) and severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
* **Deep-Dive Inspection Matrix**: Inspect CVSS base metrics, EPSS exploit likelihood percentages, CWE taxonomy with tooltips, and active in-the-wild exploitation indicators.
* **One-Click Remediation Workflow**: Dispatch tickets directly to Jira or ServiceNow, or execute CLI mitigation commands with SLA tracking.

### 🗺️ 2. Attack Surface Intelligence (The Threat & Actor Plane)
* **MITRE ATT&CK Matrix Heatmap**: Interactive tactic heatmap with statistical interpolation across multiple metric modes (`PSSS`, `EPSS`, `CVSS`, `Fleet Exposure`).
* **Top CVE Priority Ranking**: Configurable bar charts ranking highest-risk vulnerabilities with customizable themes (`Amber`, `Flame`, `Cyan`).
* **CIA Triad Impact Breakdown**: SVG charts and category filters quantifying the impact on Confidentiality, Integrity, and Availability.
* **APT Actor Dossiers**: Comprehensive threat intelligence profiles (e.g., APT29 Cozy Bear, Volt Typhoon, Lazarus Group) detailing target industries, associated CVEs, and Indicators of Compromise (IOCs).

### 🤖 3. Sentinel AI Autonomous Assistant
* **Dual AI Orchestration**: Seamlessly toggle between Google Gemini API and local offline Ollama models.
* **10+ Function Calling Tools**: Executes backend commands to query vulnerabilities, recalibrate formula weights, trigger NVD data ingestion, and run ML vector predictions.
* **Quick-Action Prompt Chips**: Interactive prompt chips for rapid analysis execution.

### 📑 4. Executive & Operational Intel Generator (The Synthesis Plane)
* **Modular Brief Builder**: Toggleable report sections for PSSS Breakdown, Top Threat Vectors, MITRE Saturation, Remediation SLAs, and APT Campaigns.
* **Dual-Theme Support**: Dark preview mode for SOC monitors and light paper styling for physical printing or PDF export.

### 🔒 5. System Audit & IAM Governance (The Trust & Governance Plane)
* **Role-Based Access Control (RBAC)**: Directory of SOC analyst identities, hardware MFA enforcement status, and granular permission toggle flags.
* **Tamper-Evident Audit Trail**: Audit logging for all formula overrides, status transitions, and data sync operations with JSON diff payload viewers.
* **Ingestion Pipeline Telemetry**: Real-time latency and sync health monitoring for NIST NVD, FIRST EPSS, and MITRE STIX/TAXII streams.

---

## 🛠️ 8. Technology Stack

```
ThreatLens.AI Architecture
├── Frontend (React 19 + TypeScript 5 + Vite 8 + Tailwind CSS 3.4)
├── Backend API (FastAPI + Python 3.10+ + Uvicorn + Pydantic v2)
├── Machine Learning (scikit-learn + NumPy + Pandas)
├── AI / LLM Layer (Google Gemini API + Ollama Local LLMs + Tool Calling Dispatcher)
└── Intelligence Datasets (NIST NVD API v2.0 + FIRST EPSS Feed + MITRE ATT&CK Enterprise)
```

### Detailed Component Stack:

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend Framework** | **React 19.x**, **TypeScript 5.x**, **Vite 8.x** |
| **Styling & UI Design** | **Tailwind CSS 3.4**, Custom Dark Mode SOC Design System, Glassmorphism |
| **Icons & Visuals** | **Lucide React**, Custom SVG Data Visualizations & Heatmap Colormaps |
| **Backend Framework** | **FastAPI 0.100+**, **Python 3.10+**, **Uvicorn** ASGI Server |
| **Data Validation** | **Pydantic v2** Schema Models |
| **Machine Learning Engine** | **scikit-learn** (TF-IDF Vectorizer + Multi-Output Logistic Regression) |
| **Numerical Processing** | **NumPy**, **Pandas** (Vectorized risk calculations & interpolation) |
| **LLM & AI Copilot** | **Google Gemini API** (`gemini-2.5-flash`, `gemini-3.x`), **Ollama** (`llama3.2`, `qwen2.5`) |
| **AI Tool Calling** | Custom JSON Schema Tool Dispatcher executing live backend mutations |
| **Cyber Datasets** | **NIST NVD API v2.0**, **FIRST EPSS Feed**, **MITRE ATT&CK Matrix** |

---

*ThreatLens.AI — HackMatrix 2026 Round 2 Project Documentation*
