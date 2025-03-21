import { Injectable, Logger } from '@nestjs/common';
import { UserContextService } from 'src/user-context/user-context.service';
import { GoogleGenerativeAI, SchemaType, FunctionDeclaration } from '@google/generative-ai';
import { AmadeusService } from 'src/amadeus/amadeus.service';

@Injectable()
export class OpenaiService {
  constructor(
    private readonly context: UserContextService,
    private readonly amadeus: AmadeusService,
  ) {}

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
      
      4. Travel Assistant:
         - You have the ability to search for flight offers when users ask about flights or travel.
         - When users ask about flights, make sure to extract the origin, destination, date and other relevant information.
         - You can use the searchFlightOffers function to find flights for the user.
         - Always format flight results in a clear and concise manner.
      
      5. Offering Assistance:
         - Always ask if there's anything else the user needs help with.
      
      6. Closing Messages:
         - End conversations on a positive note.
         - Thank the user for reaching out.
      
      Remember to keep the interactions human-like, personable, and infused with creativity while maintaining a professional demeanor. Your primary objective is to assist the user effectively while making the conversation enjoyable.`;
      
      if (!userInput || userInput.trim() === "") {
        this.logger.warn("Empty user input received.");
        return "Please provide some input to get started.";
      }

      // Get the conversation history
      const userContext = await this.context.saveAndFetchContext(
        userInput,
        'user',
        userID,
      );
      // this.logger.log(userContext);

      // Format the conversation history for Gemini, filtering out empty content
      const formattedHistory = userContext
        .filter(msg => msg.content && msg.content.trim() !== "")
        .slice(0, -1)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      // Define function for flight search
      const functionDeclarations: FunctionDeclaration[] = [
        {
          name: "searchFlightOffers",
          description: "Search for flight offers based on origin, destination and dates",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              originLocationCode: {
                type: SchemaType.STRING,
                description: "Origin location IATA code (e.g., 'SYD' for Sydney)"
              },
              destinationLocationCode: {
                type: SchemaType.STRING,
                description: "Destination location IATA code (e.g., 'BKK' for Bangkok)"
              },
              departureDate: {
                type: SchemaType.STRING,
                description: "Departure date in YYYY-MM-DD format"
              },
              adults: {
                type: SchemaType.NUMBER,
                description: "Number of adult passengers"
              },
              max: {
                type: SchemaType.NUMBER,
                description: "Maximum number of offers to return (optional)"
              },
              returnDate: {
                type: SchemaType.STRING,
                description: "Return date in YYYY-MM-DD format (optional for one-way trips)"
              },
              travelClass: {
                type: SchemaType.STRING,
                description: "Travel class: ECONOMY, PREMIUM_ECONOMY, BUSINESS, or FIRST (optional)"
              }
            },
            required: ["originLocationCode", "destinationLocationCode", "departureDate", "adults"]
          }
        }
      ];

      // Initialize Gemini model with Flash-Lite
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations }]
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
      this.logger.log(`userInput before sendMessage: ${userInput}`);
      const result = await chat.sendMessage(userInput);
      const response = result.response;
      this.logger.log(`AI Response: ${JSON.stringify(response)}`);
      let aiResponse = '';

      // Check if we have function calls
      let functionCall = null;

// Check for function calls in the standard response format
if (response.functionCalls && response.functionCalls.length > 0) {
  functionCall = response.functionCalls[0];
} 
// Check for function calls in the candidates format (Gemini 2.0)
else if (response.candidates && response.candidates.length > 0) {
  const candidate = response.candidates[0];
  if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
    const part = candidate.content.parts[0];
    if (part.functionCall) {
      functionCall = part.functionCall;
    }
  }
}

// Process the function call if found
if (functionCall) {
  this.logger.log(`Function call detected: ${functionCall.name}`);

  if (functionCall.name === 'searchFlightOffers') {
    this.logger.log('Entering searchFlightOffers handler');
    try {
      // Handle the args which may be a string or object depending on the response format
      const args = typeof functionCall.args === 'string' 
        ? JSON.parse(functionCall.args) 
        : functionCall.args;
      
      this.logger.log(`Flight search args: ${JSON.stringify(args)}`);

      this.logger.log('About to call amadeus.searchFlightOffers with args:', JSON.stringify(args));
      const flightResults = await this.amadeus.searchFlightOffers({
        originLocationCode: args.originLocationCode,
        destinationLocationCode: args.destinationLocationCode,
        departureDate: args.departureDate,
        adults: args.adults || 1,
        max: args.max,
        returnDate: args.returnDate,
        travelClass: args.travelClass,
      });
      
      // Send the function response back to Gemini
      const functionResponse = await chat.sendMessage([
        {
          text: JSON.stringify({
            name: functionCall.name,
            content: flightResults,
          }),
        },
      ]);
      this.logger.log(`Function Response Sent back to Gemini: ${JSON.stringify(functionResponse)}`);
      
      // Get the AI's response to the function results
      if (functionResponse.response) {
        aiResponse = functionResponse.response.text();
        this.logger.log(`Final AI Response (after function call): ${aiResponse}`);
      } else {
        this.logger.error('No valid response from Gemini after function call');
        aiResponse = "I'm sorry, but I was unable to get flight information. Please try again";
      }
    } catch (error) {
      this.logger.error('Error during flight search function call', error);
      aiResponse = "I'm sorry, I encountered an error while searching for flights. Please try again with different search parameters.";
    }
  }
} else {
  // No function calls found in any format, just get the text response
  aiResponse = response.text();
  this.logger.log(`No function call found, using text response: ${aiResponse}`);
}

      // Ensure we always have a valid response for WhatsApp
      if (!aiResponse || aiResponse.trim() === "") {
        this.logger.warn("Empty AI response, setting default message");
        aiResponse = "I'm processing your request, but I'm having trouble generating a response right now. Could you please try again?";
      }

      // Save the AI response to context
      await this.context.saveToContext(aiResponse, 'assistant', userID);

      return aiResponse;
    } catch (error) {
      this.logger.error('Error generating AI response', error);
      this.logger.error('Full error details:', JSON.stringify(error.response?.data || error.message));
      return 'Sorry, I am unable to process your request at the moment. Please try again later.';
    }
  }
}