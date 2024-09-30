import { GoogleGenerativeAI } from "@google/generative-ai";

// Use environment variables for API keys in production
const apiKey = "AIzaSyALtOb6ai0DaV-DFpcjX7n8Sf9HSasNWhQ";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0.7, // Adjust for balance between creativity and coherence
  topP: 0.9,
  topK: 50,
  maxOutputTokens: 500, // Max number of tokens for the response
  responseMimeType: "text/plain",
};
export async function fetchEmailReply(
  email: string,
  tone: string,
  formalityLevel: number
): Promise<string> {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    // Construct the request prompt, incorporating tone and formality
    const requestPrompt = `
      Please craft an email reply based on the following details:
      Tone: ${tone}.
      Formality: ${formalityLevel}.
      Respond to the following email:
      ${email}
    `;

    // Send the constructed prompt to the AI model
    const result = await chatSession.sendMessage(requestPrompt);

    return result.response.text(); // Return the AI-generated reply
  } catch (error: any) {
    console.error("Error generating reply:", error);

    // Handle safety-related errors and general errors
    if (error.message.includes("SAFETY")) {
      return "Reply generation is blocked due to safety settings. Please modify the content.";
    }
    return "An error occurred while generating the reply. Please try again.";
  }
}
