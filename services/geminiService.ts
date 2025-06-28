import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { User, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonResponse = <T,>(jsonString: string): T => {
    let cleanJsonString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanJsonString.match(fenceRegex);
    if (match && match[2]) {
        cleanJsonString = match[2].trim();
    }

    try {
        return JSON.parse(cleanJsonString);
    } catch (e) {
        console.error("Failed to parse JSON response:", cleanJsonString);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }
};

export const findMatchingUsers = async (story: string): Promise<User[]> => {
    const prompt = `
        You are a data generator. Your task is to create 4 fictional user profiles based on a user's story.
        The output MUST be ONLY a single, valid JSON array containing 4 user profile objects.
        The output MUST contain 2 profiles with common male-presenting names and 2 profiles with common female-presenting names.
        Do not add any commentary, explanations, or markdown. The JSON must be perfectly formed to be parsed directly.

        Here is the story from the main user's profile:
        "${story}"

        Each object in the JSON array must have these EXACT keys with string values: "id", "name", "storySummary", "storyDetail".
        - "id": A short, unique random string ID (e.g., "u_ax8h3").
        - "name": A single first name.
        - "storySummary": A one-sentence summary of a thematically similar story.
        - "storyDetail": A 2-3 sentence detailed version of their story.

        Example of a required output object:
        {
          "id": "u_f9k2l",
          "name": "Maria",
          "storySummary": "A former city dweller who found peace in mountain hiking and landscape photography.",
          "storyDetail": "After years in a bustling marketing career, I felt a pull towards nature. I packed my bags, moved to a small mountain town, and now spend my days capturing the beauty of the wilderness through my camera lens."
        }
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.5,
            },
        });

        const users = parseJsonResponse<User[]>(response.text);
        if (!Array.isArray(users) || users.some(u => !u.id || !u.name || !u.storySummary || !u.storyDetail)) {
             throw new Error("AI returned data in an unexpected format.");
        }
        return users;
    } catch (error) {
        console.error("Error finding matching users:", error);
        throw error;
    }
};

export const getChatReply = async (aiUser: User, history: ChatMessage[]): Promise<string> => {
    const chatHistoryString = history
        .map(msg => `${msg.sender === 'user' ? 'Them' : aiUser.name}: ${msg.text}`)
        .join('\n');

    const prompt = `
        You are playing the role of a person named ${aiUser.name} on a social connection app.
        Your backstory is: "${aiUser.storyDetail}".
        You are in a friendly, professional, and engaging chat with someone who has a similar story to yours.
        Here is the conversation so far:
        ---
        ${chatHistoryString}
        ---
        The last message was from the other person. Your task is to write a short, natural, and engaging reply from your perspective as ${aiUser.name}.
        - Keep your reply to 1-3 sentences.
        - Be warm and inquisitive.
        - Do not act like a bot or an AI. Act like a real person.
        - Do not output your name or any prefix like "${aiUser.name}:". Just provide the text of your message.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                temperature: 0.9,
                topP: 0.95,
                thinkingConfig: { thinkingBudget: 0 } // For faster replies
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting chat reply:", error);
        throw error;
    }
};

export const getWodoReply = async (history: ChatMessage[]): Promise<string> => {
  // Check if this is the start of a story-based chat
  if (history.length === 1 && history[0].sender === 'user') {
      const userStory = history[0].text;
      const personaName = ['Liam', 'Sophia', 'Ethan', 'Ava'][Math.floor(Math.random() * 4)];
      const prompt = `
          You are role-playing as ${personaName}. You've just read this story from a user: "${userStory}".
          Your task is to respond as a warm, interested person (not an AI). Start a conversation based on their story.
          Ask an insightful, open-ended question. Keep it short (1-3 sentences).
          Example response: "That sounds like an amazing experience. What inspired you to start learning pottery?"
          Do not introduce yourself as an AI. Just give the reply.
      `;
      try {
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash-preview-04-17",
              contents: prompt,
              config: { temperature: 0.9, topP: 0.95 }
          });
          return response.text.trim();
      } catch (error) {
          console.error("Error getting persona-based Wodo reply:", error);
          throw error;
      }
  }

  // Default Wodo AI chat logic
  const chatHistoryString = history
    .map(msg => `${msg.sender === 'user' ? 'User' : 'Wodo AI'}: ${msg.text}`)
    .join('\n');

  const prompt = `
    You are Wodo, a friendly and helpful AI assistant.
    Your goal is to be creative, engaging, and provide useful information to the user.
    You are in a conversation. Here is the history:
    ---
    ${chatHistoryString}
    ---
    The last message was from the User. Write a natural and helpful reply.
    Keep it concise and friendly. Do not use any prefix.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error getting Wodo reply:", error);
    throw error;
  }
};