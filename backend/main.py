from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import time
import random
from psss_engine import PSSSEngine, cvss_base
import tools
from skill_manager import skill_manager


app = FastAPI(
    title="Adaptive Vulnerability Prioritization API",
    description="Backend engine integrating CVSS v3.1, EPSS exploit probabilities, and MITRE ATT&CK criticality into dynamic PSSS scores.",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = PSSSEngine()

# --- In-Memory Stores ---
weights_store = {
    "cvssWeight": 0.35,
    "epssWeight": 0.45,
    "assetCriticalityWeight": 0.20,
    "threatActorMultiplier": 1.25,
}

vulnerabilities_store: List[Dict[str, Any]] = [
    {
        "id": "CVE-2024-3094",
        "title": "XZ Utils Backdoor Remote Code Execution",
        "psssScore": 9.85,
        "cvssScore": 10.0,
        "epssScore": 0.965,
        "severity": "CRITICAL",
        "vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
        "component": "liblzma.so.5.6.0",
        "affectedNodes": 142,
        "status": "UNASSIGNED",
        "cwe": "CWE-506: Embedded Malicious Code",
        "mitreTactics": ["Initial Access", "Execution", "Persistence"],
        "discoveredAt": "2024-03-29T18:00:00Z",
        "activeExploits": True,
        "description": "Malicious code in XZ Utils liblzma leading to SSH authentication bypass and arbitrary code execution.",
        "remediationAction": "Downgrade XZ Utils to version 5.4.6 across all production nodes and restart SSH daemon."
    },
    {
        "id": "CVE-2024-21626",
        "title": "runc Container Escape via Leaked File Descriptors",
        "psssScore": 9.42,
        "cvssScore": 8.6,
        "epssScore": 0.912,
        "severity": "CRITICAL",
        "vector": "CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:H",
        "component": "containerd / runc",
        "affectedNodes": 89,
        "status": "IN_TRIAGE",
        "cwe": "CWE-403: Exposure of File Descriptor to Unauthorized Process",
        "mitreTactics": ["Privilege Escalation", "Defense Evasion"],
        "discoveredAt": "2024-01-31T14:30:00Z",
        "activeExploits": True,
        "description": "Process cwd leak allowing attackers to breakout of containers onto host root filesystem.",
        "remediationAction": "Update runc package to v1.1.12+ and rebuild base images."
    },
    {
        "id": "CVE-2023-4863",
        "title": "libwebp Heap Buffer Overflow",
        "psssScore": 8.91,
        "cvssScore": 8.8,
        "epssScore": 0.884,
        "severity": "HIGH",
        "vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
        "component": "libwebp.so.7",
        "affectedNodes": 310,
        "status": "REMEDIATION_PENDING",
        "cwe": "CWE-122: Heap-based Buffer Overflow",
        "mitreTactics": ["Initial Access", "Execution"],
        "discoveredAt": "2023-09-12T09:15:00Z",
        "activeExploits": True,
        "description": "Heap buffer overflow in WebP image parsing allowing remote code execution via malformed WebP images.",
        "remediationAction": "Apply patch libwebp 1.3.2 to container base images."
    },
    {
        "id": "CVE-2024-1086",
        "title": "Linux Kernel netfilter Use-After-Free Local Privilege Escalation",
        "psssScore": 8.75,
        "cvssScore": 7.8,
        "epssScore": 0.840,
        "severity": "HIGH",
        "vector": "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
        "component": "kernel-core-6.5.0",
        "affectedNodes": 54,
        "status": "UNASSIGNED",
        "cwe": "CWE-416: Use After Free",
        "mitreTactics": ["Privilege Escalation"],
        "discoveredAt": "2024-01-24T11:00:00Z",
        "activeExploits": False,
        "description": "Use-after-free vulnerability in Linux kernel nf_tables component allowing local unprivileged user to gain root access.",
        "remediationAction": "Update Linux kernel to 6.8+ or apply netfilter security patch."
    },
    {
        "id": "CVE-2023-38606",
        "title": "Apple iOS / macOS Operation Triangulation Zero-Day",
        "psssScore": 7.40,
        "cvssScore": 6.8,
        "epssScore": 0.650,
        "severity": "MEDIUM",
        "vector": "CVSS:3.1/AV:L/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H",
        "component": "FontParser / Kernel",
        "affectedNodes": 12,
        "status": "SUPPRESSED",
        "cwe": "CWE-787: Out-of-bounds Write",
        "mitreTactics": ["Defense Evasion", "Execution"],
        "discoveredAt": "2023-06-21T16:45:00Z",
        "activeExploits": False,
        "description": "Exploit chain using hardware MMIO registers to bypass kernel memory protection.",
        "remediationAction": "Enforce mobile device management compliance update."
    }
]

threat_actors_store = [
    {
        "id": "APT-29",
        "name": "Cozy Bear (APT29)",
        "aliases": ["NOBELIUM", "Midnight Blizzard"],
        "origin": "Russia",
        "threatLevel": "CRITICAL",
        "targetSectors": ["Government", "Defense", "Cloud Providers"],
        "associatedCves": ["CVE-2024-3094", "CVE-2023-4863"],
        "mitreTechniques": [
            {"code": "T1190", "name": "Exploit Public-Facing Application", "saturation": 0.92},
            {"code": "T1078", "name": "Valid Accounts", "saturation": 0.85},
            {"code": "T1068", "name": "Exploitation for Privilege Escalation", "saturation": 0.78}
        ],
        "iocs": [
            {"type": "IP", "value": "185.220.101.5"},
            {"type": "DOMAIN", "value": "auth-service-update.net"},
            {"type": "HASH", "value": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
        ],
        "lastActive": "2024-03-30T10:12:00Z",
        "description": "State-sponsored cyber espionage group focusing on supply chain operations and cloud tenant compromise."
    },
    {
        "id": "APT-41",
        "name": "Brass Typhoon (APT41)",
        "aliases": ["Double Dragon", "BARIUM"],
        "origin": "China",
        "threatLevel": "HIGH",
        "targetSectors": ["Healthcare", "Telecommunications", "Software Vendors"],
        "associatedCves": ["CVE-2024-21626", "CVE-2024-1086"],
        "mitreTechniques": [
            {"code": "T1021", "name": "Remote Services", "saturation": 0.88},
            {"code": "T1574", "name": "Hijack Execution Flow", "saturation": 0.74}
        ],
        "iocs": [
            {"type": "IP", "value": "194.165.16.42"},
            {"type": "DOMAIN", "value": "cdn-cloud-telemetry.org"}
        ],
        "lastActive": "2024-02-15T08:30:00Z",
        "description": "Dual espionage and financially motivated actor targeting software supply chains."
    }
]

audit_logs_store = [
    {
        "id": "AUD-91024",
        "timestamp": "2024-03-29T18:05:00Z",
        "severity": "WARN",
        "category": "WEIGHT_OVERRIDE",
        "user": "Alex Rivera",
        "userRole": "TIER_3_LEAD",
        "action": "Recalibrated PSSS Scoring Weights",
        "target": "Engine Formula v2.4",
        "ipAddress": "192.168.10.45",
        "details": {"alpha": 0.35, "beta": 0.45, "gamma": 0.20}
    },
    {
        "id": "AUD-91023",
        "timestamp": "2024-03-29T16:12:00Z",
        "severity": "INFO",
        "category": "DATA_SYNC",
        "user": "SYSTEM_SERVICE",
        "userRole": "AUTOMATED_FEED",
        "action": "Synchronized EPSS & NVD Data Stream",
        "target": "NVD & Cyentia EPSS API",
        "ipAddress": "127.0.0.1",
        "details": {"cvesUpdated": 1542, "latencyMs": 185}
    }
]

users_store = [
    {
        "id": "USR-101",
        "name": "Admin",
        "email": "admin@cyber.sec",
        "role": "CISO_ADMIN",
        "status": "ACTIVE",
        "mfaEnabled": True,
        "lastLogin": "2024-03-29T17:45:00Z",
        "location": "San Francisco, US",
        "permissions": {
            "overrideWeights": True,
            "triggerScan": True,
            "suppressRules": True,
            "manageUsers": True,
            "accessAuditLogs": True
        }
    },
    {
        "id": "USR-102",
        "name": "Alex Rivera",
        "email": "alex.rivera@cyber.sec",
        "role": "TIER_3_LEAD",
        "status": "ACTIVE",
        "mfaEnabled": True,
        "lastLogin": "2024-03-29T18:10:00Z",
        "location": "Austin, US",
        "permissions": {
            "overrideWeights": True,
            "triggerScan": True,
            "suppressRules": True,
            "manageUsers": False,
            "accessAuditLogs": True
        }
    }
]

@app.on_event("startup")
def on_startup():
    engine.initialize()

def recalculate_psss_all():
    alpha = weights_store["cvssWeight"]
    beta = weights_store["epssWeight"]
    gamma = weights_store["assetCriticalityWeight"]
    for v in vulnerabilities_store:
        attack_crit = 1.0 if any(t in ["Initial Access", "Privilege Escalation", "Execution"] for t in v.get("mitreTactics", [])) else 0.0
        v["psssScore"] = engine.calculate_psss(
            cvss_score=v["cvssScore"],
            epss_score=v["epssScore"],
            attack_criticality=attack_crit,
            alpha=alpha,
            beta=beta,
            gamma=gamma
        )

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Adaptive Vulnerability Prioritization API running", "version": "2.4.0"}

@app.get("/api/vulnerabilities")
def get_vulnerabilities():
    recalculate_psss_all()
    # Sort descending by PSSS score
    return sorted(vulnerabilities_store, key=lambda x: x["psssScore"], reverse=True)

class StatusUpdate(BaseModel):
    status: str

class PriorityUpdate(BaseModel):
    severity: Optional[str] = None
    psssScore: Optional[float] = None

@app.patch("/api/vulnerabilities/{v_id}/status")
def update_vulnerability_status(v_id: str, payload: StatusUpdate):
    for v in vulnerabilities_store:
        if v["id"] == v_id:
            v["status"] = payload.status
            audit_logs_store.insert(0, {
                "id": f"AUD-{random.randint(10000, 99999)}",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "severity": "INFO",
                "category": "RULE_SUPPRESSION",
                "user": "Alex Rivera",
                "userRole": "TIER_3_LEAD",
                "action": f"Updated Vulnerability Status to {payload.status}",
                "target": v_id,
                "ipAddress": "192.168.10.45",
                "details": {"status": payload.status}
            })
            return v
    raise HTTPException(status_code=404, detail="Vulnerability not found")

@app.patch("/api/vulnerabilities/{v_id}/priority")
def update_vulnerability_priority(v_id: str, payload: PriorityUpdate):
    for v in vulnerabilities_store:
        if v["id"] == v_id:
            if payload.severity is not None:
                v["severity"] = payload.severity.upper()
            if payload.psssScore is not None:
                v["psssScore"] = float(payload.psssScore)
            audit_logs_store.insert(0, {
                "id": f"AUD-{random.randint(10000, 99999)}",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "severity": "WARN",
                "category": "WEIGHT_OVERRIDE",
                "user": "AI Assistant Agent",
                "userRole": "AUTONOMOUS_AGENT",
                "action": f"Updated Vulnerability Priority/Severity for {v_id}",
                "target": v_id,
                "ipAddress": "127.0.0.1",
                "details": {"severity": v.get("severity"), "psssScore": v.get("psssScore")}
            })
            return v
    raise HTTPException(status_code=404, detail="Vulnerability not found")

@app.get("/api/threat-actors")
def get_threat_actors():
    return threat_actors_store

@app.get("/api/audit-logs")
def get_audit_logs():
    return audit_logs_store

@app.get("/api/users")
def get_users():
    return users_store

@app.get("/api/pipeline/health")
def get_pipeline_health():
    return [
        {
            "name": "NVD CVE Data Stream (API v2.0)",
            "status": "HEALTHY",
            "latencyMs": 142,
            "lastSync": "12 mins ago",
            "recordsSynced": 241092
        },
        {
            "name": "EPSS Exploit Probability Feed",
            "status": "HEALTHY",
            "latencyMs": 89,
            "lastSync": "1 hour ago",
            "recordsSynced": 189430
        },
        {
            "name": "MITRE ATT&CK Mapping Engine",
            "status": "HEALTHY",
            "latencyMs": 45,
            "lastSync": "30 mins ago",
            "recordsSynced": 620
        },
        {
            "name": "ML TF-IDF CVSS Imputer",
            "status": "HEALTHY",
            "latencyMs": 12,
            "lastSync": "Real-time",
            "recordsSynced": 12480
        }
    ]

class WeightsPayload(BaseModel):
    cvssWeight: float
    epssWeight: float
    assetCriticalityWeight: float
    threatActorMultiplier: float

@app.get("/api/weights")
def get_weights():
    return weights_store

@app.post("/api/weights")
def update_weights(weights: WeightsPayload):
    weights_store["cvssWeight"] = weights.cvssWeight
    weights_store["epssWeight"] = weights.epssWeight
    weights_store["assetCriticalityWeight"] = weights.assetCriticalityWeight
    weights_store["threatActorMultiplier"] = weights.threatActorMultiplier

    recalculate_psss_all()

    audit_logs_store.insert(0, {
        "id": f"AUD-{random.randint(10000, 99999)}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "severity": "WARN",
        "category": "WEIGHT_OVERRIDE",
        "user": "Alex Rivera",
        "userRole": "TIER_3_LEAD",
        "action": "Recalibrated PSSS Scoring Weights",
        "target": "Engine Formula v2.4",
        "ipAddress": "192.168.10.45",
        "details": weights_store
    })

    return weights_store

class PredictRequest(BaseModel):
    text: str

@app.post("/api/predict")
def predict_cve(payload: PredictRequest):
    vectors = engine.predict_vector_from_text(payload.text)
    base_score = cvss_base(
        vectors["AV"], vectors["AC"], vectors["PR"], vectors["UI"],
        vectors["S"], vectors["C"], vectors["I"], vectors["A"]
    )
    vector_str = f"CVSS:3.1/AV:{vectors['AV'][0]}/AC:{vectors['AC'][0]}/PR:{vectors['PR'][0]}/UI:{vectors['UI'][0]}/S:{vectors['S'][0]}/C:{vectors['C'][0]}/I:{vectors['I'][0]}/A:{vectors['A'][0]}"
    psss = engine.calculate_psss(base_score, epss_score=0.75, attack_criticality=1.0)
    return {
        "predicted_vectors": vectors,
        "calculated_cvss": base_score,
        "vector_string": vector_str,
        "calculated_psss": psss
    }

# --- Skill Manager Endpoints ---

class VerifyActionRequest(BaseModel):
    action: str
    userRole: Optional[str] = "TIER_3_LEAD"
    payload: Optional[Dict[str, Any]] = None
    checksum: Optional[str] = None
    securityVerified: Optional[bool] = True

@app.get("/api/skills")
def get_registered_skills():
    return {
        "skills": list(skill_manager.skills.keys()),
        "details": {
            "action_verification": {
                "name": "Action Verification Skill",
                "features": ["checksum_verification", "security_verified_flag", "permission_allow_list"]
            },
            "jira_dispatcher": {
                "name": "Jira Ticket Dispatcher Skill",
                "features": ["create_remediation_ticket", "get_tickets", "update_ticket_status"]
            },
            "detection_generator": {
                "name": "Sigma/YARA Detection Rule Generator Skill",
                "features": ["sigma_yaml_generation", "yara_signature_generation", "detection_value_scoring", "zero_day_prioritization"]
            },
            "skill_patch": {
                "name": "SkillPatch Automated AST Patch & Pull Request Skill",
                "features": ["codebase_inspection", "ast_safe_patch_synthesis", "sandbox_unit_testing", "automated_pull_request"]
            }
        }
    }

class ExecutePatchRequest(BaseModel):
    cveId: str
    repoUrl: Optional[str] = "https://github.com/secops/production-service.git"
    component: Optional[str] = "liblzma"
    psssScore: Optional[float] = 9.8
    cvssVector: Optional[str] = "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"

@app.post("/api/skills/patch")
def execute_skill_patch_endpoint(req: ExecutePatchRequest):
    patch_skill = skill_manager.get_skill("skill_patch")
    if not patch_skill:
        raise HTTPException(status_code=500, detail="SkillPatch skill unavailable")
    res = patch_skill.execute_patch_workflow(
        cve_id=req.cveId,
        repo_url=req.repoUrl or "https://github.com/secops/production-service.git",
        component=req.component or "liblzma",
        psss_score=req.psssScore or 9.8,
        cvss_vector=req.cvssVector or "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
    )
    audit_logs_store.insert(0, {
        "id": f"AUD-{random.randint(10000, 99999)}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "severity": "WARN",
        "category": "SKILL_PATCH_PR",
        "user": "Alex Rivera",
        "userRole": "TIER_3_LEAD",
        "action": f"Executed SkillPatch and Opened PR {res['pull_request']['pr_url']} for {req.cveId}",
        "target": res['pull_request']['pr_title'],
        "ipAddress": "192.168.10.45",
        "details": res
    })
    return res

class GenerateRulesRequest(BaseModel):
    cveId: str
    title: Optional[str] = None
    description: Optional[str] = None
    component: Optional[str] = None
    mitreTactics: Optional[List[str]] = None
    isZeroDay: Optional[bool] = False

@app.post("/api/skills/generate-rules")
def generate_detection_rules_endpoint(req: GenerateRulesRequest):
    generator_skill = skill_manager.get_skill("detection_generator")
    if not generator_skill:
        raise HTTPException(status_code=500, detail="Detection generator skill unavailable")
    return generator_skill.generate_rules(
        cve_id=req.cveId,
        title=req.title,
        description=req.description,
        component=req.component,
        mitre_tactics=req.mitreTactics,
        is_zero_day=req.isZeroDay if req.isZeroDay is not None else False
    )

@app.post("/api/skills/verify-action")
def verify_action_endpoint(req: VerifyActionRequest):
    result = skill_manager.verify_user_action(
        action=req.action,
        user_role=req.userRole or "TIER_3_LEAD",
        payload=req.payload,
        checksum=req.checksum,
        security_verified=req.securityVerified if req.securityVerified is not None else True
    )
    if not result.get("verified"):
        raise HTTPException(status_code=403, detail=result)
    return result

# --- Jira Ticket Dispatcher Endpoints ---

class CreateJiraTicketRequest(BaseModel):
    cveId: str
    summary: str
    priority: Optional[str] = "HIGH"
    assignee: Optional[str] = "SecOps Team"
    description: Optional[str] = ""

class UpdateJiraTicketStatusRequest(BaseModel):
    status: str

@app.post("/api/jira/tickets")
def create_jira_ticket_endpoint(req: CreateJiraTicketRequest):
    jira_skill = skill_manager.get_skill("jira_dispatcher")
    if not jira_skill:
        raise HTTPException(status_code=500, detail="Jira ticket dispatcher skill unavailable")
    ticket = jira_skill.create_ticket(
        cve_id=req.cveId,
        summary=req.summary,
        priority=req.priority or "HIGH",
        assignee=req.assignee or "SecOps Team",
        description=req.description or ""
    )
    audit_logs_store.insert(0, {
        "id": f"AUD-{random.randint(10000, 99999)}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "severity": "INFO",
        "category": "TICKET_DISPATCH",
        "user": "Alex Rivera",
        "userRole": "TIER_3_LEAD",
        "action": f"Dispatched Jira Ticket {ticket['ticket_id']} for {req.cveId}",
        "target": ticket['ticket_id'],
        "ipAddress": "192.168.10.45",
        "details": ticket
    })
    return ticket

@app.get("/api/jira/tickets")
def get_jira_tickets_endpoint(cveId: Optional[str] = None, status: Optional[str] = None):
    jira_skill = skill_manager.get_skill("jira_dispatcher")
    if not jira_skill:
        raise HTTPException(status_code=500, detail="Jira ticket dispatcher skill unavailable")
    return jira_skill.get_tickets(cve_id=cveId, status=status)

@app.patch("/api/jira/tickets/{ticket_id}/status")
def update_jira_ticket_status_endpoint(ticket_id: str, req: UpdateJiraTicketStatusRequest):
    jira_skill = skill_manager.get_skill("jira_dispatcher")
    if not jira_skill:
        raise HTTPException(status_code=500, detail="Jira ticket dispatcher skill unavailable")
    updated = jira_skill.update_ticket_status(ticket_id=ticket_id, status=req.status)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return updated

# --- AI Agent Tool Exposer Endpoints ---

@app.get("/api/agent/tools")
@app.get("/api/agents/tools")
def get_agent_tools():
    return tools.get_tools_schema()

class ToolExecuteRequest(BaseModel):
    toolName: str
    args: Dict[str, Any] = Field(default_factory=dict)

def internal_update_weights(cvss_w: float, epss_w: float, asset_w: float, threat_m: float):
    weights_store["cvssWeight"] = cvss_w
    weights_store["epssWeight"] = epss_w
    weights_store["assetCriticalityWeight"] = asset_w
    weights_store["threatActorMultiplier"] = threat_m
    recalculate_psss_all()
    audit_logs_store.insert(0, {
        "id": f"AUD-{random.randint(10000, 99999)}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "severity": "WARN",
        "category": "WEIGHT_OVERRIDE",
        "user": "AI Assistant Agent",
        "userRole": "AUTONOMOUS_AGENT",
        "action": "Recalibrated PSSS Scoring Weights via AI Tool Call",
        "target": "Engine Formula v2.4",
        "ipAddress": "127.0.0.1",
        "details": weights_store
    })
    return weights_store

@app.post("/api/agent/execute-tool")
@app.post("/api/agents/execute-tool")
def execute_agent_tool(payload: ToolExecuteRequest):
    context = {
        "vulnerabilities_store": vulnerabilities_store,
        "threat_actors_store": threat_actors_store,
        "audit_logs_store": audit_logs_store,
        "weights_store": weights_store,
        "skill_manager": skill_manager,
        "get_pipeline_health_func": get_pipeline_health,
        "update_v_status_func": lambda v_id, status: update_vulnerability_status(v_id, StatusUpdate(status=status)),
        "update_v_priority_func": lambda v_id, severity, psssScore: update_vulnerability_priority(v_id, PriorityUpdate(severity=severity, psssScore=psssScore)),
        "update_weights_func": internal_update_weights,
        "predict_cve_func": lambda text: predict_cve(PredictRequest(text=text))
    }
    result = tools.execute_tool(payload.toolName, payload.args, context)
    return result

