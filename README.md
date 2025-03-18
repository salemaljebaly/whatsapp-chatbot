# WhatsApp AI Assistant

A NestJS application that integrates WhatsApp Cloud API with Gemini AI to create an intelligent WhatsApp chatbot with flight booking capabilities.

## Features

- 🤖 AI-powered responses using Google's Gemini 2.0 Flash-Lite
- 💬 WhatsApp integration via Meta's WhatsApp Cloud API
- 🧠 Conversation context management using Redis
- 🔒 Secure handling of user data with phone number hashing
- ✈️ Flight booking functionality with major providers
- 🌐 Easy deployment with Ngrok for development

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Redis server
- WhatsApp Business API Account
- Google Gemini API Key
- Ngrok for local development

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# WhatsApp Cloud API
WHATSAPP_CLOUD_API_VERSION=v18.0
WHATSAPP_CLOUD_API_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_CLOUD_API_ACCESS_TOKEN=your_access_token
WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN=your_verification_token

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Redis
REDIS_URL=redis://localhost:6379
HASHING_SALT=your_hashing_salt

```

## Installation

```bash
# Clone the repository
git clone git@github.com:salemaljebaly/whatsapp-chatbot.git
cd whatsapp-chatbot

# Install dependencies
npm install

# Start Redis (if not running)
redis-server

# Run the application
npm run start:dev
```

## Setting Up Ngrok for Local Development

To expose your local server to the internet (required for WhatsApp webhook verification):

1. Install Ngrok:
   ```bash
   npm install -g ngrok
   # OR
   yarn global add ngrok
   ```

2. Start Ngrok to create a tunnel to your local server:
   ```bash
   ngrok http 3000
   ```

3. Copy the HTTPS URL provided by Ngrok (e.g., `https://a1b2-c3d4-e5f6.ngrok.io`)

4. In your WhatsApp Business Account:
   - Go to the WhatsApp Developer Portal
   - Navigate to your app
   - Under "Webhooks", set your callback URL to `{NGROK_URL}/whatsapp/webhook`
   - Use your `WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN` as the verification token

## Architecture

The application follows a modular architecture using NestJS:

- **WhatsApp Module**: Handles incoming messages and webhook verification
- **OpenAI Module**: Integrates with Google's Gemini AI API to generate responses
- **User Context Module**: Manages conversation history using Redis
- **Flight Booking Module**: Provides flight booking functionalities via API integration

## Flight Booking Flow - this feature must do in next task

1. User initiates flight booking with a command like "Book a flight"
2. Bot uses function calling to gather necessary details:
   - Departure and arrival locations
   - Dates
   - Number of passengers
   - Class preference
3. Bot searches for available flights via API
4. User selects a flight from the options
5. Bot confirms booking details and completes the transaction

## Testing

The project includes test files for major components.

```bash
# Run unit tests
npm run test

# Test WhatsApp connection
npm run test:whatsapp

# Test Gemini connection
npm run test:gemini
```

## Deployment

For production deployment:

1. Set up a proper reverse proxy (Nginx, Apache) with SSL
2. Deploy Redis with proper security measures
3. Configure WhatsApp webhook to your production URL
4. Set up environment variables in your production environment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)