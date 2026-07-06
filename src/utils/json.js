export function parseJson(jsonString) {
  try {
    // Basic cleanup in case the LLM wrapped it in markdown code blocks
    const cleaned = jsonString.replace(/^```json/m, '').replace(/```$/m, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}
