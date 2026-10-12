import urllib.request
import json

def test_endpoints():
    print("=== STORMGUARD AI SYSTEM VERIFICATION ===")
    
    # 1. Backend Health Check
    try:
        req = urllib.request.urlopen('http://127.0.0.1:8000/api/health')
        health = json.loads(req.read().decode())
        print(f"[OK] Backend Health (Port 8000): {health['status']} | Model Loaded: {health['model_loaded']}")
    except Exception as e:
        print(f"[FAIL] Backend Health Check: {e}")

    # 2. Scenarios
    try:
        req = urllib.request.urlopen('http://127.0.0.1:8000/api/scenarios')
        scenarios = json.loads(req.read().decode())
        print(f"[OK] Available Scenarios: {len(scenarios)} ({scenarios[0]['title']})")
    except Exception as e:
        print(f"[FAIL] Scenarios Check: {e}")

    # 3. Timeline T0..T60 Deterministic Values
    try:
        req = urllib.request.urlopen('http://127.0.0.1:8000/api/weather/timeline?scenario_id=ncr_cloudburst')
        frames = json.loads(req.read().decode())
        print(f"[OK] Timeline Timesteps ({len(frames)} frames):")
        for f in frames:
            print(f"     Frame {f['timestep']}: Genesis={f['overall_genesis_prob']}%, "
                  f"Thunder={f['hazards']['thunderstorm_risk_pct']}%, "
                  f"Hail={f['hazards']['hail_risk_pct']}%, "
                  f"Cloudburst={f['hazards']['cloudburst_risk_pct']}%, "
                  f"Threat={f['overall_threat_level']}")
    except Exception as e:
        print(f"[FAIL] Timeline Check: {e}")

    # 4. Explainable AI (XAI)
    try:
        req = urllib.request.urlopen('http://127.0.0.1:8000/api/explanation?scenario_id=ncr_cloudburst&timestep=T0')
        xai = json.loads(req.read().decode())
        print(f"[OK] XAI Feature Contributions ({len(xai['contributing_factors'])} factors):")
        for factor in xai['contributing_factors'][:3]:
            print(f"     * {factor['feature_name']}: {factor['contribution_score']}% (Value: {factor['value']} {factor['unit']})")
        print(f"     Reasoning: {xai['meteorological_reasoning'][:80]}...")
    except Exception as e:
        print(f"[FAIL] XAI Check: {e}")

    # 5. Frontend Check (Vite port 5173)
    try:
        req = urllib.request.urlopen('http://127.0.0.1:5173')
        print(f"[OK] Frontend UI (Port 5173): Status {req.getcode()} (Zero API-Key Required)")
    except Exception as e:
        print(f"[FAIL] Frontend UI Check: {e}")

    print("=== VERIFICATION COMPLETE ===")

if __name__ == '__main__':
    test_endpoints()
