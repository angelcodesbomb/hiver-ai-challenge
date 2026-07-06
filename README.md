# AI Email Suggested Response System

## Overview

This project implements an end-to-end AI-powered customer support email reply system.

Given an incoming customer email, the system generates a suggested response by learning from a historical dataset of customer emails and agent replies. The generated response is then evaluated using a structured, weighted rubric that measures response quality beyond simple exact-match accuracy.

The primary focus of this project is building a robust and explainable evaluation system for AI-generated customer support replies.

---

# Deliverables

✅ Public GitHub Repository

Submit the GitHub repository URL containing this project.

---

## Dataset

The repository contains:

- `dataset.json`
- `generateDataset.js`

### How the dataset was built

The dataset consists of **40 synthetic customer support email-response pairs** generated using an LLM.

Each record contains:

- Category
- Customer Email
- Ideal Agent Reply

The dataset spans multiple customer support scenarios including:

- Refunds
- Billing
- Shipping
- Password Reset
- Account Management
- Feature Requests
- Bug Reports
- Complaints
- Membership Cancellation
- Meetings

Synthetic data was chosen because it allows complete control over response quality while covering diverse customer interactions without requiring proprietary customer data.

If the dataset is not included, it can be regenerated using:

```bash
npm run generate
```

---

# Response Generation

The response generation pipeline is fully runnable end-to-end.

Workflow:

```
Incoming Email
        │
        ▼
Find Similar Historical Examples
(3 examples from same category)
        │
        ▼
Few-shot Prompt Construction
        │
        ▼
LLM Response Generation
        │
        ▼
Suggested Customer Reply
```

Instead of fine-tuning, this project uses **few-shot prompting**.

The dataset is split into:

- 35 training examples
- 5 unseen test emails

For each test email:

1. Three historical examples from the same category are selected.
2. These examples are inserted into the prompt.
3. The LLM generates a suggested reply.

This grounds the response in historical examples while remaining lightweight and reproducible.

---

# Accuracy & Evaluation System

This project intentionally avoids exact-match evaluation because multiple customer support responses can be correct while using different wording.

Instead, responses are evaluated using a weighted quality rubric.

## Evaluation Metrics

| Metric | Weight |
|---------|--------|
| Intent Coverage | 30% |
| Completeness | 20% |
| Accuracy & Faithfulness | 20% |
| Professionalism & Tone | 15% |
| Clarity & Actionability | 15% |

Each generated response receives:

- Individual metric scores
- Reasoning for every metric
- Weighted overall score

The evaluator also reports:

- Per-response evaluation
- Average metric scores
- Overall system score

Example output:

```
Overall Score : 9.52 / 10

Intent           : 9.60
Completeness     : 9.40
Accuracy         : 9.20
Professionalism  : 9.80
Clarity          : 9.60
```

Evaluation results are automatically saved in:

```
evaluation_results.json
```

---

# Why this Evaluation Metric?

Customer support quality cannot be measured using exact string matching.

Two responses may use completely different wording while both solving the customer's problem.

Instead, this evaluation measures qualities that matter in real customer support:

- Did the reply solve the customer's request?
- Did it answer every important point?
- Did it avoid unsupported or hallucinated information?
- Was the tone professional and empathetic?
- Were the next steps communicated clearly?

This makes the evaluation more representative of real-world customer support quality than traditional exact-match metrics.

---

# Project Architecture

```
Generate Dataset
        │
        ▼
dataset.json
        │
        ▼
35 Training Examples
        │
        ▼
Retrieve 3 Similar Examples
        │
        ▼
LLM Response Generator
        │
        ▼
Generated Reply
        │
        ▼
LLM Evaluation
        │
        ▼
Metric Scores
        │
        ▼
Overall System Report
```

---

# Repository Structure

```
src/

├── prompts/
│   ├── dataset.js
│   ├── generator.js
│   ├── evaluator.js
│
├── generateDataset.js
├── main.js
├── llm.js
├── utils/

dataset.json
evaluation_results.json
README.md
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
CEREBRAS_API_KEY=your_api_key_here
```

A `.env.example` file is also included.

---

# Installation

Clone the repository.

Install dependencies.

```bash
npm install
```

---

# Running the Project

## Generate the dataset

```bash
npm run generate
```

## Run the complete response generation and evaluation pipeline

```bash
npm start
```

The system will automatically:

1. Load the dataset
2. Split it into training and testing examples
3. Generate suggested replies
4. Evaluate every generated reply
5. Produce overall evaluation metrics
6. Save results to `evaluation_results.json`

---

# Trade-offs

Given the challenge constraints, the following design decisions were made:

- Used synthetic data instead of proprietary customer emails.
- Used few-shot prompting instead of fine-tuning.
- Used category-based retrieval instead of embedding-based retrieval.
- Used an LLM-as-a-Judge evaluation framework to provide scalable automated assessment.

These choices prioritize simplicity, reproducibility, and an end-to-end working solution.

---

# Limitations

- The dataset is synthetic and may not capture every real-world customer support scenario.
- LLM-based evaluation can introduce subjective bias.
- Category-based retrieval is simpler than semantic embedding retrieval.
- Human evaluation would provide a stronger benchmark in production systems.

---

# AI Usage

AI tools were used to:

- Generate the synthetic dataset.
- Generate customer support replies.
- Evaluate responses using a structured weighted rubric.
- Assist with implementation and debugging.

The overall system design, evaluation methodology, prompt engineering, and integration were developed and assembled into a complete end-to-end pipeline.