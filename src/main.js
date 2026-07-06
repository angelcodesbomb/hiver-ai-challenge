import fs from "fs";
import { callCerebras2 } from "./llm.js";
import { GENERATOR_PROMPT } from "./prompts/generator.js";
import { EVALUATOR_PROMPT } from "./prompts/evaluator.js";
import { parseJson } from "./utils/json.js";
import { withRetry } from "./utils/retry.js";

async function main() {
  if (!fs.existsSync("dataset.json")) {
    console.error("dataset.json not found. Run dataset generation first.");
    process.exit(1);
  }

  const dataset = JSON.parse(fs.readFileSync("dataset.json", "utf8"));

  // Shuffle dataset
  // Shuffle dataset
const shuffled = [...dataset].sort(() => Math.random() - 0.5);

// Fixed test size of 5
const TEST_SIZE = 5;

const train = shuffled.slice(0, shuffled.length - TEST_SIZE);
const test = shuffled.slice(shuffled.length - TEST_SIZE);

console.log(`Training examples: ${train.length}`);
console.log(`Testing examples: ${test.length}`);
  const results = [];

  let totalScore = 0;
let totalIntent = 0;
let totalCompleteness = 0;
let totalAccuracy = 0;
let totalProfessionalism = 0;
let totalClarity = 0;

  for (let i = 0; i < test.length; i++) {
    const item = test[i];

    console.log(`\nProcessing ${i + 1}/${test.length}`);

    // Retrieve examples from TRAIN only
    let examples = train
      .filter((x) => x.category === item.category)
      .slice(0, 3);

    // fallback
    if (examples.length < 3) {
      examples = [
        ...examples,
        ...train.filter((x) => x.category !== item.category).slice(0, 3 - examples.length),
      ];
    }

    const context = examples
      .map(
        (e, idx) => `
Example ${idx + 1}

Customer:
${e.email}

Reply:
${e.reply}
`
      )
      .join("\n");

    const generatorInput = `${context}

Now reply to this customer.

Customer:
${item.email}
`;

    const aiReply = await withRetry(() =>
      callCerebras2(GENERATOR_PROMPT, generatorInput)
    );

    const evaluatorInput = `
Customer Email:

${item.email}

Ideal Reply:

${item.reply}

Generated Reply:

${aiReply}
`;

    const evalRaw = await withRetry(() =>
      callCerebras2(EVALUATOR_PROMPT, evaluatorInput)
    );
    console.log("RAW EVALUATOR RESPONSE:");
    console.log(evalRaw);
    const evaluation = parseJson(evalRaw);

if (!evaluation) {
    console.log("Evaluator returned invalid JSON.");
    console.log(evalRaw);
    continue;
}

totalScore += evaluation.overall;
totalIntent += evaluation.intent.score;
totalCompleteness += evaluation.completeness.score;
totalAccuracy += evaluation.accuracy.score;
totalProfessionalism += evaluation.professionalism.score;
totalClarity += evaluation.clarity.score;

    console.log(`Overall Score: ${evaluation.overall}`);

    results.push({
      category: item.category,
      customerEmail: item.email,
      idealReply: item.reply,
      generatedReply: aiReply,
      evaluation,
    });
  }

  const average = totalScore / results.length;

const metrics = {
  intent: totalIntent / results.length,
  completeness: totalCompleteness / results.length,
  accuracy: totalAccuracy / results.length,
  professionalism: totalProfessionalism / results.length,
  clarity: totalClarity / results.length,
};

const finalResults = {
  averageScore: average,
  averageMetrics: metrics,
  totalEmailsEvaluated: results.length,
  results,
};

  fs.writeFileSync(
    "evaluation_results.json",
    JSON.stringify(finalResults, null, 2)
  );

  console.log("\n=======================================");
console.log("FINAL EVALUATION REPORT");
console.log("=======================================");
console.log(`Emails Evaluated : ${results.length}`);
console.log(`Overall Score    : ${average.toFixed(2)}/10`);
console.log("");
console.log("Metric Breakdown");
console.log("------------------------------");
console.log(`Intent           : ${metrics.intent.toFixed(2)}/10`);
console.log(`Completeness     : ${metrics.completeness.toFixed(2)}/10`);
console.log(`Accuracy         : ${metrics.accuracy.toFixed(2)}/10`);
console.log(`Professionalism  : ${metrics.professionalism.toFixed(2)}/10`);
console.log(`Clarity          : ${metrics.clarity.toFixed(2)}/10`);
console.log("");
console.log("Results saved to evaluation_results.json");
}

main();