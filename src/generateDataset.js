import fs from 'fs';
import { callCerebras } from './llm.js';
import { DATASET_PROMPT } from './prompts/dataset.js';
import { parseJson } from './utils/json.js';
import { withRetry } from './utils/retry.js';


// A robust cleaner to strip out markdown code blocks if present
function cleanJsonString(str) {
  return str
    .replace(/^```json\s*/i, '') // Remove opening ```json
    .replace(/^```\s*/i, '')     // Remove opening ```
    .replace(/\s*```$/, '')      // Remove closing ```
    .trim();
}

async function generateDataset() {
  const targetExamples = 40; 
  const batches = 4;
  let allEmails = [];

  console.log(`Generating dataset of ~${targetExamples} emails in ${batches} batches...`);
  
  for (let i = 1; i <= batches; i++) {
  console.log(`\n--- Running Batch ${i}/${batches} (Requesting 10 examples) ---`);

  try {
    const response = await withRetry(
      () => callCerebras(DATASET_PROMPT, "Generate exactly 10 examples."),
      3,
      1000 // Retry after 1 second instead of 5
    );

    console.log("Raw Response Preview:");
    console.log(response.substring(0, 200) + "...");

    const cleanedResponse = cleanJsonString(response);
    const dataset = parseJson(cleanedResponse);

    if (!Array.isArray(dataset)) {
      console.log(cleanedResponse);
      throw new Error("Model did not return a JSON array.");
    }

    console.log(`Generated ${dataset.length} examples.`);
    allEmails.push(...dataset);

  } catch (err) {
    console.error(`Batch ${i} failed:`, err.message);
  }
}

  if (allEmails.length > 0) {
    fs.writeFileSync('dataset.json', JSON.stringify(allEmails, null, 2));
    console.log(`\nSuccess! Saved a total of ${allEmails.length} emails to dataset.json`);
  } else {
    console.error('\nFailed to generate any emails across all batches.');
  }
}

generateDataset();