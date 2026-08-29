import os
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

def cvss_base(av: str, ac: str, pr: str, ui: str, s: str, c: str, i: str, a: str) -> float:
    """Computes CVSS v3.1 Base Score according to FIRST specification."""
    try:
        av_map = {"NETWORK": 0.85, "ADJACENT_NETWORK": 0.62, "LOCAL": 0.55, "PHYSICAL": 0.2}
        ac_map = {"LOW": 0.77, "HIGH": 0.44}
        pru_map = {"NONE": 0.85, "LOW": 0.62, "HIGH": 0.27}
        prc_map = {"NONE": 0.85, "LOW": 0.68, "HIGH": 0.5}
        ui_map = {"NONE": 0.85, "REQUIRED": 0.62}
        cia_map = {"NONE": 0.0, "LOW": 0.22, "HIGH": 0.56}

        AV = av_map.get(str(av).upper(), 0.85)
        AC = ac_map.get(str(ac).upper(), 0.77)
        UIv = ui_map.get(str(ui).upper(), 0.85)
        scope_str = str(s).upper()
        
        pr_val = str(pr).upper()
        if scope_str == "CHANGED":
            PR = prc_map.get(pr_val, 0.85)
        else:
            PR = pru_map.get(pr_val, 0.85)

        C_ = cia_map.get(str(c).upper(), 0.0)
        I_ = cia_map.get(str(i).upper(), 0.0)
        A_ = cia_map.get(str(a).upper(), 0.0)

        iss = 1.0 - (1.0 - C_) * (1.0 - I_) * (1.0 - A_)
        if scope_str == "UNCHANGED":
            impact = 6.42 * iss
        else:
            impact = 7.52 * (iss - 0.029) - 3.25 * ((iss - 0.02) ** 15)

        exploit = 8.22 * AV * AC * PR * UIv

        if impact <= 0:
            return 0.0

        if scope_str == "UNCHANGED":
            base = min(10.0, impact + exploit)
        else:
            base = min(10.0, 1.08 * (impact + exploit))

        return round(float(np.ceil(base * 10) / 10.0), 1)
    except Exception:
        return 7.5


CRITICAL_TECHNIQUES = {
    "T1190": "Initial Access",
    "T1078": "Initial Access",
    "T1068": "Privilege Escalation",
    "T1574": "Privilege Escalation",
    "T1021": "Lateral Movement"
}

class PSSSEngine:
    def __init__(self, data_path: str = "nvdcve-2.0-modified.json"):
        self.data_path = data_path
        self.df: Optional[pd.DataFrame] = None
        self.models: Dict[str, Pipeline] = {}
        self.labels = ["AV", "AC", "PR", "UI", "S", "C", "I", "A"]
        self.is_initialized = False

    def initialize(self):
        """Loads NVD dataset, trains ML vector imputer models, and calculates scores."""
        records = []
        if os.path.exists(self.data_path):
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            for item in data.get("vulnerabilities", []):
                cve = item.get("cve", {})
                cve_id = cve.get("id")
                descriptions = cve.get("descriptions", [])
                desc = descriptions[0].get("value") if descriptions else ""

                av = ac = pr = ui = s = c = i = a = score = None
                metrics_data = cve.get("metrics", {})
                if "cvssMetricV31" in metrics_data and metrics_data["cvssMetricV31"]:
                    cvss_entry = metrics_data["cvssMetricV31"][0]
                    m = cvss_entry.get("cvssData", {})
                    av, ac, pr, ui, s = (
                        m.get("attackVector"),
                        m.get("attackComplexity"),
                        m.get("privilegesRequired"),
                        m.get("userInteraction"),
                        m.get("scope"),
                    )
                    c, i, a = (
                        m.get("confidentialityImpact"),
                        m.get("integrityImpact"),
                        m.get("availabilityImpact"),
                    )
                    score = m.get("baseScore")

                records.append({
                    "cve_id": cve_id,
                    "cve_text": desc,
                    "AV": av,
                    "AC": ac,
                    "PR": pr,
                    "UI": ui,
                    "S": s,
                    "C": c,
                    "I": i,
                    "A": a,
                    "CVSS_base": score
                })
            self.df = pd.DataFrame(records)
        else:
            # Fallback synthetic dataset if raw JSON is absent
            self.df = pd.DataFrame([
                {
                    "cve_id": "CVE-2024-3094",
                    "cve_text": "Malicious code in XZ Utils liblzma leading to SSH authentication bypass",
                    "AV": "NETWORK", "AC": "LOW", "PR": "NONE", "UI": "NONE", "S": "CHANGED",
                    "C": "HIGH", "I": "HIGH", "A": "HIGH", "CVSS_base": 10.0
                },
                {
                    "cve_id": "CVE-2024-21626",
                    "cve_text": "runc process.cwd container breakout leak allowing host filesystem access",
                    "AV": "LOCAL", "AC": "LOW", "PR": "NONE", "UI": "REQUIRED", "S": "CHANGED",
                    "C": "HIGH", "I": "HIGH", "A": "HIGH", "CVSS_base": 8.6
                },
                {
                    "cve_id": "CVE-2023-4863",
                    "cve_text": "Heap buffer overflow in WebP image parsing in libwebp",
                    "AV": "NETWORK", "AC": "LOW", "PR": "NONE", "UI": "REQUIRED", "S": "UNCHANGED",
                    "C": "HIGH", "I": "HIGH", "A": "HIGH", "CVSS_base": 8.8
                }
            ])

        # Train ML vector imputer for missing metrics
        df_labeled = self.df.dropna(subset=["CVSS_base", "cve_text"]).copy()
        if len(df_labeled) > 5:
            for label in self.labels:
                labeled_sub = df_labeled.dropna(subset=[label])
                if len(labeled_sub) > 2 and labeled_sub[label].nunique() > 1:
                    pipe = Pipeline([
                        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=0.95)),
                        ("clf", LogisticRegression(max_iter=300, class_weight="balanced"))
                    ])
                    pipe.fit(labeled_sub["cve_text"], labeled_sub[label])
                    self.models[label] = pipe

        self.is_initialized = True

    def predict_vector_from_text(self, text: str) -> Dict[str, str]:
        """Uses trained TF-IDF models to predict missing CVSS metric fields from text."""
        defaults = {
            "AV": "NETWORK", "AC": "LOW", "PR": "NONE",
            "UI": "NONE", "S": "UNCHANGED", "C": "HIGH", "I": "HIGH", "A": "HIGH"
        }
        if not self.is_initialized:
            self.initialize()

        predicted = {}
        for label, default_val in defaults.items():
            if label in self.models:
                try:
                    pred = self.models[label].predict([text])[0]
                    predicted[label] = pred
                except Exception:
                    predicted[label] = default_val
            else:
                predicted[label] = default_val
        return predicted

    def calculate_psss(
        self,
        cvss_score: float,
        epss_score: float,
        attack_criticality: float,
        alpha: float = 0.35,
        beta: float = 0.45,
        gamma: float = 0.20
    ) -> float:
        """Calculates final PSSS priority score (0.0 to 10.0)."""
        cvss_norm = cvss_score / 10.0
        score = (alpha * cvss_norm + beta * epss_score + gamma * attack_criticality) * 10.0
        return round(float(min(10.0, max(0.0, score))), 2)
