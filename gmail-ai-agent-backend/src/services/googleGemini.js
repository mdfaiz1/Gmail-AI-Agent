import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const generateReply = async (
  tone,
  email,
  generatetedMsg,
  retries = 3
) => {
  try {
    // 1. Construct the prompt using template literals
    const prompt = `
    ROLE:
    You are an expert professional communications assistant. Your goal is to draft high-quality email replies.

    INPUT CONTEXT:
    1. Incoming Email (HTML): The user has received this email.
    2. User Notes/Context: The user has provided specific details (facts, dates, decisions) to include in the reply.
    3. Desired Tone: "${tone}"

    INSTRUCTIONS:
    1. ANALYSIS: Deeply understand the incoming email's intent. Then, review the "User Notes" to see how the user wants to respond.
    2. DATA INTEGRATION (CRITICAL): 
       - Use the "User Notes" to answer questions and fill in specific details. 
       - If the notes contain a date, time, or specific answer, weave it naturally into the reply.
       - Do NOT just copy-paste the notes; rewrite them to match the desired tone.
    3. TONE ADAPTATION: 
       - 'Professional': Polite, concise, formal.
       - 'Friendly': Warm, casual, approachable.
       - 'Direct': Straight to the point, minimal fluff.
    4. FORMATTING: Use clear paragraph breaks. Do NOT use markdown bolding (**) or headers (##).

    GUARDRAILS:
    - If the "User Notes" provide specific facts (dates, times, names), USE THEM. Do not use placeholders like "[Insert Date]" if the data is provided.
    - If the info is NOT in the notes and NOT in the email, only then use a placeholder like "[Insert Details]".
    - Do NOT include the subject line in the body.
    - Output ONLY the JSON.

    OUTPUT FORMAT (JSON ONLY):
    You must output a valid JSON object with exactly two fields:
    1. "subject": A concise, relevant subject line for the reply.
    2. "message": The email body text.

    ------------------------------
    INCOMING EMAIL:
    """
    ${email}
    """

    USER NOTES / CONTEXT TO INCLUDE:
    """
    ${
      generatetedMsg
        ? `The user has provided a rough draft. Please ENHANCE and POLISH the following:\n\nDraft Subject: ${generatetedMsg.subject}\nDraft Message: ${generatetedMsg.message}`
        : "No specific notes provided. Draft a generic reply based on the email."
    }
    """
    ------------------------------
`;

    // 2. Send the prompt to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Ensure you use 1.5-flash
      contents: prompt,
    });
    console.log(response.candidates[0].content.parts[0].text);
    let textResponse = response.candidates[0].content.parts[0].text;
    textResponse = textResponse
      .replace(/^```json/g, "")
      .replace(/^```/g, "")
      .replace(/```$/g, "");
    textResponse = textResponse.trim();
    // console.log("Generated Reply JSON:", jsonObject);

    const jsonObject = JSON.parse(textResponse);
    // Optional: Return the text if you need to send it back to the frontend
    return jsonObject;
  } catch (error) {
    const isTemporaryError = error.status === 503 || error.status === 429;
    if (isTemporaryError && retries > 0) {
      console.warn(
        `[Gemini] Model overloaded. Retrying in 2s... (${retries} left)`
      );
      await delay(2000); // Wait 2 seconds
      return generateReply(tone, email, generatetedMsg, retries - 1); // Try again
    }
    console.error("[Gemini] Error generating reply:");
  }
};
