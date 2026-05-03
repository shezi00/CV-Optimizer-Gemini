from ai_engine import analyze_cv_with_ai

# USE YOUR HARDCODED KEY HERE
test_key = "AIzaSyDb6r-Ma0WLuUxDGJiTh0ZSHescR_btOiM"

print("--- Testing AI Connection ---")
try:
    result = analyze_cv_with_ai("I am a Python developer", "Looking for Python coder", test_key)
    print("AI Response:", result)
except Exception as e:
    print("❌ AI Failed with error:", str(e))