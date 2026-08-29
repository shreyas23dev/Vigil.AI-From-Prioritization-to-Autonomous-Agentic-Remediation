# 🔐 Adaptive Vulnerability Prioritization Framework

Combine the strengths of **CVSS**, **EPSS**, and **MITRE ATT&CK techniques** to intelligently rank and prioritize vulnerabilities.

---

## 🚀 Overview

This project provides a robust, data-driven approach to vulnerability risk assessment. By integrating CVSS and EPSS scoring with contextual intelligence from MITRE ATT&CK, you can make smarter decisions about what to remediate first.

### How It Works

1. **Machine Learning Prediction**  
   Fills in missing CVSS metrics for CVEs using ML models.

2. **Dynamic CVSS Score Recalculation**  
   Updates the base score with predicted values for more accurate risk representation.

3. **EPSS Exploitability Integration**  
   Includes the likelihood of exploitation in the wild.

4. **ATT&CK-based Criticality Boost**  
   Applies threat-context boosts using MITRE ATT&CK mappings.

5. **Unified PSSS_final Score**  
   Produces a single priority score for actionable vulnerability triage.

---

## 📦 Key Outputs

- **Prioritized CVE List**  
  Receive a ranked list of vulnerabilities based on combined risk factors.
  
- **Streamlit Dashboard**  
  Explore results interactively with visualizations and filters.

---

## ⚙️ Tech Stack

- **Python** + **pandas**
- **scikit-learn** (ML modeling)
- **streamlit** (dashboard UI)

---

## 🏁 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/shreyas23dev/Adaptive-Vulnerability-Prioritization-with-MITRE-ATT-CK-Integration---Robust.git
   cd Adaptive-Vulnerability-Prioritization-with-MITRE-ATT-CK-Integration---Robust
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the dashboard**
   ```bash
   streamlit run dashboard.py
   ```

---

## 📚 References

- [CVSS](https://www.first.org/cvss/)
- [EPSS](https://www.first.org/epss/)
- [MITRE ATT&CK](https://attack.mitre.org/)

---

## 📝 License

MIT License

