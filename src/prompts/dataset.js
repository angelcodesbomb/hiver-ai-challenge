export const DATASET_PROMPT = `
You are creating a synthetic customer support dataset.

Generate 10 realistic email-response pairs.

Categories must only be:
- refund
- billing
- shipping
- password
- account
- bug
- feature_request
- cancellation
- complaint
- meeting

Requirements:
- Emails should sound like real customers.
- Responses should be professional and concise.
- Responses should fully answer the customer's request.
- Vary the writing style and difficulty.
- Include polite greetings and sign-offs when appropriate.

Return ONLY valid JSON. No markdown. No explanations.

Format:

[
  {
    "category":"refund",
    "email":"...",
    "reply":"..."
  }
]

No markdown.
No explanations.
`;