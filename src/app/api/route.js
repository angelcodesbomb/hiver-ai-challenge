import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// A fast model to handle the task
const DEFAULT_MODEL = "llama-3.3-70b-versatile"; 

// 1. GENERATE THE EMAIL REPLY
export async function generateEmailReply(incomingEmail) {
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a professional customer support agent. Reply concisely and helpfully." },
      { role: "user", content: `Reply to this customer email: ${incomingEmail}` }
    ],
    model: DEFAULT_MODEL,
  });

  return response.choices[0].message.content;
}

// 2. THE EVALUATION (Enforcing a structured JSON output)
export async function evaluateReply(incomingEmail, aiGeneratedReply, groundTruthRules) {
  const response = await groq.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are a quality assurance auditor. Score the AI reply from 1 to 5 based on how well it satisfies the ground truth rules. Return ONLY a valid JSON object matching this schema: { \"score\": number, \"reason\": \"string\" }" 
      },
      { 
        role: "user", 
        content: `Email: ${incomingEmail}\nAI Reply: ${aiGeneratedReply}\nRules to follow: ${groundTruthRules}` 
      }
    ],
    model: DEFAULT_MODEL,
    response_format: { type: "json_object" } // Forces Groq to give you clean JSON data back
  });

  return JSON.parse(response.choices[0].message.content);
}