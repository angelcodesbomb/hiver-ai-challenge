import { Cerebras } from "@cerebras/cerebras_cloud_sdk";
import dotenv from "dotenv";

dotenv.config();



const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

export async function callCerebras2(system, user, requireJson = false) {
  const response = await cerebras.chat.completions.create({
    model: "gpt-oss-120b",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: requireJson
      ? { type: "json_object" }
      : { type: "text" },
    max_tokens: 4096,
  });

  return response.choices[0].message.content;
}

export async function callCerebras(system, user) {
  const response = await cerebras.chat.completions.create({
    model: "gemma-4-31b",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_completion_tokens: 4096,
    temperature: 0.8,
  });

  return response.choices[0].message.content;
}