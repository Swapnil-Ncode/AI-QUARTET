import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const MODELS = ["o1-mini", "gemini", "deepseek", "groq"];
const BACKEND_URL = "http://localhost:5000";
const TEST_PROMPT = "What is 2+2?";

async function testBackend() {
  console.log("\n📋 AI Quartet Integration Test");
  console.log("================================\n");

  // Test 1: Check API Keys
  console.log("✅ Checking API Keys...");
  let missingKeys = [];
  MODELS.forEach((model) => {
    let key = "";
    if (model === "o1-mini") key = process.env.OPENAI_API_KEY;
    if (model === "gemini") key = process.env.GEMINI_API_KEY;
    if (model === "deepseek") key = process.env.DEEPSEEK_API_KEY;
    if (model === "groq") key = process.env.GROQ_API_KEY;

    if (!key || key === "") {
      missingKeys.push(model);
      console.log(`   ❌ ${model.toUpperCase()} - Missing API Key`);
    } else {
      console.log(`   ✅ ${model.toUpperCase()} - Key configured`);
    }
  });

  if (missingKeys.length > 0) {
    console.log(`\n⚠️  ${missingKeys.length} API key(s) missing. Set them in .env file.\n`);
  }

  // Test 2: Health Check
  console.log("\n✅ Checking Backend Health...");
  try {
    const healthRes = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 5000,
    });
    console.log(`   ✅ Backend is running on port 5000`);
    console.log(`   Status: ${healthRes.data.status}`);
  } catch (err) {
    console.log(`   ❌ Backend not responding`);
    console.log(`   Error: ${err.message}`);
    console.log(`   Run: cd backend && npm start\n`);
    return;
  }

  // Test 3: Test Each Model
  console.log("\n✅ Testing API Endpoints...\n");

  for (const model of MODELS) {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/query`,
        {
          model,
          prompt: TEST_PROMPT,
        },
        { timeout: 40000 }
      );

      if (res.data.success) {
        console.log(`   ✅ ${model.toUpperCase()}`);
        console.log(`      Response: ${res.data.output.substring(0, 50)}...`);
      } else {
        console.log(`   ⚠️  ${model.toUpperCase()}`);
        console.log(`      Error: ${res.data.error}`);
      }
    } catch (err) {
      console.log(`   ❌ ${model.toUpperCase()}`);
      console.log(`      Error: ${err.message}`);
    }
  }

  console.log("\n================================");
  console.log("✅ Test Complete!\n");
}

testBackend();
