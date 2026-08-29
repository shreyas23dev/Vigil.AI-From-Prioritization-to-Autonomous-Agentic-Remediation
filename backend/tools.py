from typing import Dict, Any, List
import json
import os
import random

TOOLS_SCHEMA: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "get_vulnerabilities",
            "description": "Fetch all vulnerabilities currently tracked in the system, optionally filtering by severity or status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "severity": {
                        "type": "string",
                        "description": "Filter by severity: CRITICAL, HIGH, MEDIUM, LOW"
                    },
                    "status": {
                        "type": "string",
                        "description": "Filter by status: UNASSIGNED, IN_TRIAGE, REMEDIATION_PENDING, SUPPRESSED, RESOLVED"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_random_nvd_cves",
            "description": "Select N random CVEs (default 20) from the full NVD dataset, parse their metrics, calculate PSSS priority scores, and load them into the system for prioritization.",
            "parameters": {
                "type": "object",
                "properties": {
                    "count": {
                        "type": "integer",
                        "description": "Number of random CVEs to load from NVD dataset (default 20)"
                    },
                    "load_into_triage": {
                        "type": "boolean",
                        "description": "Whether to load these CVEs into active system memory for triage (default True)"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_vulnerability_status",
            "description": "Update the lifecycle status of a specific vulnerability by its CVE ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "v_id": {
                        "type": "string",
                        "description": "Vulnerability ID, e.g., 'CVE-2024-3094'"
                    },
                    "status": {
                        "type": "string",
                        "description": "New status: UNASSIGNED, IN_TRIAGE, REMEDIATION_PENDING, SUPPRESSED, RESOLVED"
                    }
                },
                "required": ["v_id", "status"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_vulnerability_priority",
            "description": "Assign or update the severity rating/priority level (CRITICAL, HIGH, MEDIUM, LOW) or custom PSSS priority score for a specific vulnerability by its CVE ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "v_id": {
                        "type": "string",
                        "description": "Vulnerability ID, e.g., 'CVE-2024-3094'"
                    },
                    "severity": {
                        "type": "string",
                        "description": "New priority severity rating: CRITICAL, HIGH, MEDIUM, LOW"
                    },
                    "psssScore": {
                        "type": "number",
                        "description": "Custom PSSS priority score override (0.0 to 10.0)"
                    }
                },
                "required": ["v_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_threat_actors",
            "description": "Fetch list of known threat actors, their target sectors, MITRE techniques, and indicators of compromise (IOCs).",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_audit_logs",
            "description": "Retrieve recent system audit log events including user actions, weight overrides, and data sync events.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_pipeline_health",
            "description": "Fetch current status, sync frequency, and record count for backend data pipelines (NVD, EPSS, MITRE ATT&CK).",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_scoring_weights",
            "description": "Fetch current PSSS scoring formula weights (CVSS weight, EPSS weight, Asset Criticality weight, Threat Actor multiplier).",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_scoring_weights",
            "description": "Recalibrate the PSSS scoring weights used to compute vulnerability risk scores.",
            "parameters": {
                "type": "object",
                "properties": {
                    "cvssWeight": { "type": "number", "description": "Weight for CVSS score (0.0 to 1.0)" },
                    "epssWeight": { "type": "number", "description": "Weight for EPSS score (0.0 to 1.0)" },
                    "assetCriticalityWeight": { "type": "number", "description": "Weight for asset criticality (0.0 to 1.0)" },
                    "threatActorMultiplier": { "type": "number", "description": "Multiplier for threat actor presence" }
                },
                "required": ["cvssWeight", "epssWeight", "assetCriticalityWeight", "threatActorMultiplier"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "predict_cve_vector",
            "description": "Use machine learning to predict CVSS 3.1 metrics and PSSS priority score from a raw CVE description text.",
            "parameters": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "The raw vulnerability description text to analyze"
                    }
                },
                "required": ["text"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "verify_action",
            "description": "Verify user/system action authorization, security verification flag, and optional payload checksum integrity using ActionVerificationSkill.",
            "parameters": {
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "description": "Name of the action to verify (e.g. update_vulnerability_status, update_scoring_weights)"
                    },
                    "user_role": {
                        "type": "string",
                        "description": "User or agent role (e.g. CISO_ADMIN, TIER_3_LEAD, ANALYST, AUTONOMOUS_AGENT)"
                    },
                    "payload": {
                        "type": "object",
                        "description": "Action payload data object"
                    },
                    "checksum": {
                        "type": "string",
                        "description": "Expected SHA256 checksum of payload for integrity check"
                    },
                    "security_verified": {
                        "type": "boolean",
                        "description": "Whether security verification flag is enabled (default true)"
                    }
                },
                "required": ["action"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_jira_ticket",
            "description": "Dispatch a new Jira remediation ticket for a vulnerability via JiraTicketDispatcherSkill.",
            "parameters": {
                "type": "object",
                "properties": {
                    "cve_id": {
                        "type": "string",
                        "description": "Associated CVE or vulnerability ID (e.g. 'CVE-2024-3094')"
                    },
                    "summary": {
                        "type": "string",
                        "description": "Short summary or title for the ticket"
                    },
                    "priority": {
                        "type": "string",
                        "description": "Ticket priority: CRITICAL, HIGH, MEDIUM, LOW"
                    },
                    "assignee": {
                        "type": "string",
                        "description": "Assigned team or engineer name"
                    },
                    "description": {
                        "type": "string",
                        "description": "Detailed remediation instructions or vulnerability description"
                    }
                },
                "required": ["cve_id", "summary"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_jira_tickets",
            "description": "Retrieve existing Jira remediation tickets created for vulnerabilities.",
            "parameters": {
                "type": "object",
                "properties": {
                    "cve_id": {
                        "type": "string",
                        "description": "Filter tickets by CVE ID"
                    },
                    "status": {
                        "type": "string",
                        "description": "Filter tickets by status (e.g. OPEN, IN_PROGRESS, RESOLVED, CLOSED)"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_jira_ticket",
            "description": "Update status of an existing Jira remediation ticket.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticket_id": {
                        "type": "string",
                        "description": "Ticket key, e.g., 'SEC-101'"
                    },
                    "status": {
                        "type": "string",
                        "description": "New status: OPEN, IN_PROGRESS, RESOLVED, CLOSED"
                    }
                },
                "required": ["ticket_id", "status"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_detection_rules",
            "description": "Generate Sigma SIEM YAML rule and YARA signature syntax for a vulnerability or zero-day, including detection value score.",
            "parameters": {
                "type": "object",
                "properties": {
                    "cve_id": {
                        "type": "string",
                        "description": "CVE ID or zero-day identifier (e.g. 'CVE-2024-3094')"
                    },
                    "title": {
                        "type": "string",
                        "description": "Vulnerability title"
                    },
                    "description": {
                        "type": "string",
                        "description": "Vulnerability description or exploitation details"
                    },
                    "component": {
                        "type": "string",
                        "description": "Affected component or package (e.g. liblzma, runc, kernel)"
                    },
                    "mitre_tactics": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "List of associated MITRE ATT&CK tactics"
                    },
                    "is_zero_day": {
                        "type": "boolean",
                        "description": "Whether this vulnerability is an active zero-day threat"
                    }
                },
                "required": ["cve_id"]
            }
        }
    }
]

def get_tools_schema() -> List[Dict[str, Any]]:
    return TOOLS_SCHEMA

def execute_tool(tool_name: str, args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes the specified tool using backend context (stores and helper functions),
    verifying action permissions, checksum, and security verification flag via skill_manager.
    """
    vulnerabilities_store = context["vulnerabilities_store"]
    threat_actors_store = context["threat_actors_store"]
    audit_logs_store = context["audit_logs_store"]
    weights_store = context["weights_store"]
    pipeline_health_func = context["get_pipeline_health_func"]
    update_v_status_func = context["update_v_status_func"]
    update_v_priority_func = context.get("update_v_priority_func")
    update_weights_func = context["update_weights_func"]
    predict_cve_func = context["predict_cve_func"]
    skill_mgr = context.get("skill_manager")

    # Action verification check via skill_manager
    user_role = args.get("user_role", context.get("user_role", "AUTONOMOUS_AGENT"))
    security_verified = args.get("security_verified", context.get("security_verified", True))
    checksum = args.get("checksum", context.get("checksum"))

    if skill_mgr and tool_name != "verify_action":
        verification = skill_mgr.verify_user_action(
            action=tool_name,
            user_role=user_role,
            payload=args,
            checksum=checksum,
            security_verified=security_verified
        )
        if not verification.get("verified"):
            return {
                "success": False,
                "error": f"Action verification failed for tool '{tool_name}': {verification.get('reason')}",
                "verification": verification
            }

    if tool_name == "get_vulnerabilities":
        severity_filter = args.get("severity")
        status_filter = args.get("status")
        result = vulnerabilities_store
        if severity_filter:
            result = [v for v in result if str(v.get("severity", "")).upper() == str(severity_filter).upper()]
        if status_filter:
            result = [v for v in result if str(v.get("status", "")).upper() == str(status_filter).upper()]
        return {"success": True, "vulnerabilities": result, "count": len(result)}

    elif tool_name == "get_random_nvd_cves":
        count = int(args.get("count", 20))
        load_into_triage = bool(args.get("load_into_triage", True))
        nvd_path = "nvdcve-2.0-modified.json"
        
        if not os.path.exists(nvd_path):
            return {"error": f"NVD dataset '{nvd_path}' not found on backend server."}

        try:
            with open(nvd_path, "r", encoding="utf-8") as f:
                nvd_data = json.load(f)
            
            raw_items = nvd_data.get("vulnerabilities", [])
            if not raw_items:
                return {"error": "NVD dataset contains no vulnerability entries."}

            sampled_raw = random.sample(raw_items, min(count, len(raw_items)))
            sampled_cves = []

            for idx, item in enumerate(sampled_raw):
                cve = item.get("cve", {})
                cve_id = cve.get("id", f"CVE-2024-{random.randint(1000, 9999)}")
                descs = cve.get("descriptions", [])
                desc_text = descs[0].get("value", "No description provided.") if descs else "No description provided."

                cvss_score = 7.5
                vector_str = "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
                metrics_data = cve.get("metrics", {})
                if "cvssMetricV31" in metrics_data and metrics_data["cvssMetricV31"]:
                    m = metrics_data["cvssMetricV31"][0]
                    cvss_data = m.get("cvssData", {})
                    cvss_score = float(cvss_data.get("baseScore", 7.5))
                    vector_str = cvss_data.get("vectorString", vector_str)

                # Heuristic EPSS exploit score estimation
                epss_score = round(min(0.99, max(0.01, (cvss_score / 10.0) * random.uniform(0.7, 1.05))), 3)

                # Tactics inference
                desc_lower = desc_text.lower()
                tactics = []
                if any(w in desc_lower for w in ["remote code execution", "rce", "unauthenticated", "buffer overflow", "xss"]):
                    tactics.append("Initial Access")
                if any(w in desc_lower for w in ["privilege escalation", "use after free", "kernel", "root", "elevation"]):
                    tactics.append("Privilege Escalation")
                if any(w in desc_lower for w in ["bypass", "sandbox", "escape"]):
                    tactics.append("Defense Evasion")
                if any(w in desc_lower for w in ["execution", "arbitrary code"]):
                    tactics.append("Execution")
                if not tactics:
                    tactics = ["Initial Access"]

                # PSSS calculation
                alpha = weights_store.get("cvssWeight", 0.35)
                beta = weights_store.get("epssWeight", 0.45)
                gamma = weights_store.get("assetCriticalityWeight", 0.20)
                attack_crit = 1.0 if any(t in ["Initial Access", "Privilege Escalation", "Execution"] for t in tactics) else 0.5
                psss = round(float(min(10.0, (alpha * (cvss_score / 10.0) + beta * epss_score + gamma * attack_crit) * 10.0)), 2)

                severity = "CRITICAL" if psss >= 9.0 else ("HIGH" if psss >= 7.0 else ("MEDIUM" if psss >= 4.0 else "LOW"))

                cve_obj = {
                    "id": cve_id,
                    "title": f"NVD {cve_id} Vulnerability",
                    "psssScore": psss,
                    "cvssScore": cvss_score,
                    "epssScore": epss_score,
                    "severity": severity,
                    "vector": vector_str,
                    "component": f"component-node-{idx + 1}",
                    "affectedNodes": random.randint(12, 450),
                    "status": "UNASSIGNED",
                    "cwe": "CWE-Generic",
                    "mitreTactics": tactics,
                    "discoveredAt": "2024-03-30T12:00:00Z",
                    "activeExploits": epss_score > 0.6,
                    "description": desc_text,
                    "remediationAction": f"Update package associated with {cve_id} to latest security release."
                }
                sampled_cves.append(cve_obj)

            if load_into_triage:
                # Add loaded CVEs to system store (avoiding duplicate IDs)
                existing_ids = {v["id"] for v in vulnerabilities_store}
                new_added = [v for v in sampled_cves if v["id"] not in existing_ids]
                vulnerabilities_store.extend(new_added)
                # Sort descending by PSSS score
                vulnerabilities_store.sort(key=lambda x: x["psssScore"], reverse=True)

            return {
                "success": True,
                "count": len(sampled_cves),
                "loaded_into_triage": load_into_triage,
                "cves": sampled_cves
            }
        except Exception as e:
            return {"error": f"Failed to parse random CVEs from NVD dataset: {str(e)}"}

    elif tool_name == "update_vulnerability_status":
        v_id = args.get("v_id")
        status = args.get("status")
        if not v_id or not status:
            return {"error": "Missing required arguments v_id and status"}
        try:
            updated = update_v_status_func(v_id, status)
            return {"success": True, "updatedVulnerability": updated}
        except Exception as e:
            return {"error": str(e)}

    elif tool_name == "update_vulnerability_priority":
        v_id = args.get("v_id")
        severity = args.get("severity")
        psssScore = args.get("psssScore")
        if not v_id:
            return {"error": "Missing required argument v_id"}
        if severity is None and psssScore is None:
            return {"error": "Must provide at least one of 'severity' or 'psssScore' to update priority."}
        try:
            if update_v_priority_func:
                updated = update_v_priority_func(v_id, severity, psssScore)
                return {"success": True, "updatedVulnerability": updated}
            return {"error": "Priority update function not configured in backend context."}
        except Exception as e:
            return {"error": str(e)}

    elif tool_name == "get_threat_actors":
        return {"success": True, "threatActors": threat_actors_store, "count": len(threat_actors_store)}

    elif tool_name == "get_audit_logs":
        return {"success": True, "auditLogs": audit_logs_store, "count": len(audit_logs_store)}

    elif tool_name == "get_pipeline_health":
        health_data = pipeline_health_func()
        return {"success": True, "pipelineHealth": health_data}

    elif tool_name == "get_scoring_weights":
        return {"success": True, "weights": weights_store}

    elif tool_name == "update_scoring_weights":
        cvss_w = args.get("cvssWeight")
        epss_w = args.get("epssWeight")
        asset_w = args.get("assetCriticalityWeight")
        threat_m = args.get("threatActorMultiplier")
        if any(x is None for x in [cvss_w, epss_w, asset_w, threat_m]):
            return {"error": "All weight parameters (cvssWeight, epssWeight, assetCriticalityWeight, threatActorMultiplier) are required"}
        try:
            updated_w = update_weights_func(cvss_w, epss_w, asset_w, threat_m)
            return {"success": True, "weights": updated_w}
        except Exception as e:
            return {"error": str(e)}

    elif tool_name == "predict_cve_vector":
        text = args.get("text")
        if not text:
            return {"error": "Missing text argument for prediction"}
        try:
            res = predict_cve_func(text)
            return {"success": True, "prediction": res}
        except Exception as e:
            return {"error": str(e)}

    elif tool_name == "verify_action":
        action = args.get("action")
        if not action:
            return {"error": "Missing required argument 'action'"}
        user_role = args.get("user_role", "TIER_3_LEAD")
        payload = args.get("payload")
        checksum = args.get("checksum")
        security_verified = args.get("security_verified", True)

        skill_mgr = context.get("skill_manager")
        if skill_mgr:
            res = skill_mgr.verify_user_action(
                action=action,
                user_role=user_role,
                payload=payload,
                checksum=checksum,
                security_verified=security_verified
            )
            return {"success": res.get("verified", False), "verification": res}
        else:
            # Fallback inline check if skill_manager not in context
            from skill_manager import skill_manager as sm
            res = sm.verify_user_action(
                action=action,
                user_role=user_role,
                payload=payload,
                checksum=checksum,
                security_verified=security_verified
            )
            return {"success": res.get("verified", False), "verification": res}

    elif tool_name == "create_jira_ticket":
        cve_id = args.get("cve_id")
        summary = args.get("summary")
        if not cve_id or not summary:
            return {"error": "Missing required arguments 'cve_id' and 'summary' for create_jira_ticket"}
        priority = args.get("priority", "HIGH")
        assignee = args.get("assignee", "SecOps Team")
        description = args.get("description", "")
        
        skill_mgr = context.get("skill_manager")
        jira_skill = skill_mgr.get_skill("jira_dispatcher") if skill_mgr else None
        if not jira_skill:
            from skill_manager import skill_manager as sm
            jira_skill = sm.get_skill("jira_dispatcher")
            
        ticket = jira_skill.create_ticket(
            cve_id=cve_id,
            summary=summary,
            priority=priority,
            assignee=assignee,
            description=description
        )
        # Log to audit logs if present
        if "audit_logs_store" in context:
            import time, random
            context["audit_logs_store"].insert(0, {
                "id": f"AUD-{random.randint(10000, 99999)}",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "severity": "INFO",
                "category": "TICKET_DISPATCH",
                "user": "AI Assistant Agent",
                "userRole": "AUTONOMOUS_AGENT",
                "action": f"Dispatched Jira Ticket {ticket['ticket_id']} for {cve_id}",
                "target": ticket['ticket_id'],
                "ipAddress": "127.0.0.1",
                "details": ticket
            })
        return {"success": True, "ticket": ticket}

    elif tool_name == "get_jira_tickets":
        cve_id = args.get("cve_id")
        status = args.get("status")
        skill_mgr = context.get("skill_manager")
        jira_skill = skill_mgr.get_skill("jira_dispatcher") if skill_mgr else None
        if not jira_skill:
            from skill_manager import skill_manager as sm
            jira_skill = sm.get_skill("jira_dispatcher")
        tickets = jira_skill.get_tickets(cve_id=cve_id, status=status)
        return {"success": True, "tickets": tickets, "count": len(tickets)}

    elif tool_name == "update_jira_ticket":
        ticket_id = args.get("ticket_id")
        status = args.get("status")
        if not ticket_id or not status:
            return {"error": "Missing required arguments 'ticket_id' and 'status'"}
        skill_mgr = context.get("skill_manager")
        jira_skill = skill_mgr.get_skill("jira_dispatcher") if skill_mgr else None
        if not jira_skill:
            from skill_manager import skill_manager as sm
            jira_skill = sm.get_skill("jira_dispatcher")
        updated = jira_skill.update_ticket_status(ticket_id=ticket_id, status=status)
        if not updated:
            return {"error": f"Ticket '{ticket_id}' not found."}
        return {"success": True, "ticket": updated}

    elif tool_name == "generate_detection_rules":
        cve_id = args.get("cve_id")
        if not cve_id:
            return {"error": "Missing required argument 'cve_id' for generate_detection_rules"}
        title = args.get("title")
        description = args.get("description")
        component = args.get("component")
        mitre_tactics = args.get("mitre_tactics")
        is_zero_day = bool(args.get("is_zero_day", False))

        skill_mgr = context.get("skill_manager")
        rule_skill = skill_mgr.get_skill("detection_generator") if skill_mgr else None
        if not rule_skill:
            from skill_manager import skill_manager as sm
            rule_skill = sm.get_skill("detection_generator")
        
        rules = rule_skill.generate_rules(
            cve_id=cve_id,
            title=title,
            description=description,
            component=component,
            mitre_tactics=mitre_tactics,
            is_zero_day=is_zero_day
        )
        return {"success": True, "rules": rules}

    else:
        return {"error": f"Tool '{tool_name}' is not recognized."}
