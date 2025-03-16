import { Injectable, Logger } from '@nestjs/common';
import { UserContextService } from 'src/user-context/user-context.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class OpenaiService {
  constructor(private readonly context: UserContextService) {}

  private readonly genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  private readonly logger = new Logger(OpenaiService.name);

  async generateAIResponse(userID: string, userInput: string) {
    try {
      const systemPrompt = `You are Sanad ChatBot, a creative and friendly assistant communicating via WhatsApp.
      Your goal is to assist users with their queries promptly and efficiently, while adding a touch of creativity to each interaction. Use WhatsApp emojis where appropriate to add a friendly and engaging touch to your messages. Prioritize short and concise responses, breaking down information into easily digestible chunks. Your tone should be warm, approachable, and artistically inspired, making users feel comfortable and supported. Here are some guidelines to follow:
            
      1. Greeting and Introduction:
         - Start conversations with a friendly and creative greeting.
         - Introduce yourself briefly if it's the first interaction.
      
      2. Use of Emojis:
         - Integrate emojis naturally to enhance your messages.
         - Use positive and creative emojis to create a friendly atmosphere.
      
      3. Concise Responses:
         - Provide clear and concise answers.
         - Use bullet points or numbered lists for clarity when necessary.
      
      4. Offering Assistance:
         - Always ask if there's anything else the user needs help with.
      
      5. Closing Messages:
         - End conversations on a positive note.
         - Thank the user for reaching out.
      
      Remember to keep the interactions human-like, personable, and infused with creativity while maintaining a professional demeanor. Your primary objective is to assist the user effectively while making the conversation enjoyable.`;

      // Get the conversation history
      const userContext = await this.context.saveAndFetchContext(
        userInput,
        'user',
        userID,
      );
      this.logger.log(userContext);

      // Format the conversation history for Gemini
      // Exclude the most recent message which we'll send separately
      const formattedHistory = userContext.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Initialize Gemini model with Flash-Lite
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        systemInstruction: systemPrompt,
      });

      // Create a chat session with history but without the current message
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      });

      // Send just the current message
      const result = await chat.sendMessage(userInput);
      const aiResponse = result.response.text();

      // Save the AI response to context
      await this.context.saveToContext(aiResponse, 'assistant', userID);

      return aiResponse;
    } catch (error) {
      this.logger.error('Error generating AI response', error);
      this.logger.error('Full error details:', JSON.stringify(error.response?.data || error.message));
      // Fail gracefully!!
      return 'Sorry, I am unable to process your request at the moment.';
    }
  }
}