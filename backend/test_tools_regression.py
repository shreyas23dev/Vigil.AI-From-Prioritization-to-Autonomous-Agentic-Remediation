import main
import tools
from skill_manager import skill_manager

def test_get_random_nvd_cves_tool():
    """Test get_random_nvd_cves tool returns sampled CVE objects and loads into triage memory."""
    v_store = []
    weights_store = {"cvssWeight": 0.35, "epssWeight": 0.45, "assetCriticalityWeight": 0.20}
    context = {
        "vulnerabilities_store": v_store,
        "threat_actors_store": [],
        "audit_logs_store": [],
        "weights_store": weights_store,
        "skill_manager": skill_manager,
        "get_pipeline_health_func": lambda: {},
        "update_v_status_func": lambda v, s: None,
        "update_v_priority_func": lambda v, s, p: None,
        "update_weights_func": lambda a, b, c, d: None,
        "predict_cve_func": lambda t: {}
    }

    res = tools.execute_tool("get_random_nvd_cves", {"count": 4, "load_into_triage": True}, context)
    assert res["success"] is True
    assert res["count"] == 4
    assert len(res["cves"]) == 4
    assert len(v_store) == 4

    # Verify CVE structure
    first = res["cves"][0]
    assert "id" in first
    assert "psssScore" in first
    assert "cvssScore" in first
    assert "epssScore" in first
    assert "severity" in first
    assert "vector" in first
    assert "mitreTactics" in first
    assert "description" in first


def test_get_random_cves_alias_tool():
    """Test get_random_cves tool alias works identically and passes action verification."""
    v_store = []
    weights_store = {"cvssWeight": 0.35, "epssWeight": 0.45, "assetCriticalityWeight": 0.20}
    context = {
        "vulnerabilities_store": v_store,
        "threat_actors_store": [],
        "audit_logs_store": [],
        "weights_store": weights_store,
        "skill_manager": skill_manager,
        "get_pipeline_health_func": lambda: {},
        "update_v_status_func": lambda v, s: None,
        "update_v_priority_func": lambda v, s, p: None,
        "update_weights_func": lambda a, b, c, d: None,
        "predict_cve_func": lambda t: {}
    }

    res = tools.execute_tool("get_random_cves", {"count": 3, "load_into_triage": True}, context)
    assert res["success"] is True
    assert res["count"] == 3
    assert len(res["cves"]) == 3
    assert len(v_store) == 3


def test_main_api_agent_execute_tool():
    """Test agent execution endpoint for get_random_cves and get_random_nvd_cves."""
    req1 = main.ToolExecuteRequest(toolName="get_random_nvd_cves", args={"count": 5})
    res1 = main.execute_agent_tool(req1)
    assert res1["success"] is True
    assert res1["count"] == 5

    req2 = main.ToolExecuteRequest(toolName="get_random_cves", args={"count": 5})
    res2 = main.execute_agent_tool(req2)
    assert res2["success"] is True
    assert res2["count"] == 5


def run_all_backend_tests():
    test_get_random_nvd_cves_tool()
    print("✅ test_get_random_nvd_cves_tool PASSED")
    test_get_random_cves_alias_tool()
    print("✅ test_get_random_cves_alias_tool PASSED")
    test_main_api_agent_execute_tool()
    print("✅ test_main_api_agent_execute_tool PASSED")
    print("🎉 ALL BACKEND REGRESSION TESTS PASSED!")


if __name__ == "__main__":
    run_all_backend_tests()
