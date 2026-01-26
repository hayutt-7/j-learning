const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyBKxrxW2h1TAihtpzxfE67xQx-nko5pfqg";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
    const models = ["gemini-pro", "gemini-flash-latest"];

    for (const modelName of models) {
        console.log(`Testing model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`SUCCESS with ${modelName}! Response:`, result.response.text());
            return; // Exit on first success
        } catch (e) {
            console.error(`FAILED with ${modelName}: ${e.statusText || e.message}`);
        }
    }
}

run();
