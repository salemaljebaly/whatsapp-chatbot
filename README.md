# Artistaa: AI-Powered WhatsApp Chatbot with Context-Aware Conversations

Artistaa is a NestJS-based WhatsApp chatbot that provides creative and personalized responses using OpenAI's language models. The bot maintains conversation context using Redis and integrates seamlessly with WhatsApp Cloud API to deliver a friendly, engaging user experience with emoji-enhanced responses.

The application features a robust architecture that handles message processing, context management, and AI response generation. It uses Redis for storing conversation history, ensuring contextually relevant responses while maintaining user privacy through phone number hashing. The system is designed to be reliable with graceful error handling and includes comprehensive logging for monitoring and debugging.

## Repository Structure
```
.
├── src/                          # Source code directory
│   ├── main.ts                   # Application entry point
│   ├── openai/                   # OpenAI integration module
│   │   └── openai.service.ts     # Handles AI response generation
│   ├── user-context/             # User context management module
│   │   └── user-context.service.ts # Manages conversation history in Redis
│   └── whatsapp/                 # WhatsApp integration module
│       └── whatsapp/
│           ├── whatsapp.controller.ts # Handles WhatsApp webhook endpoints
│           └── whatsapp.service.ts    # Manages WhatsApp message operations
├── test/                         # Test files directory
└── package.json                  # Project dependencies and scripts
```

## Usage Instructions
### Prerequisites
- Node.js (v14 or higher)
- Redis server
- OpenAI API key
- WhatsApp Cloud API credentials
- Environment variables:
  - OPENAI_API_KEY
  - REDIS_URL
  - WHATSAPP_CLOUD_API_VERSION
  - WHATSAPP_CLOUD_API_PHONE_NUMBER_ID
  - WHATSAPP_CLOUD_API_ACCESS_TOKEN
  - WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN
  - HASHING_SALT

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Build the application
npm run build
```

### Quick Start
1. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

2. Start the application:
```bash
npm run start
```

3. Configure WhatsApp webhook:
- Use the `/whatsapp/webhook` endpoint as your webhook URL
- Set up webhook verification token in your environment variables

### More Detailed Examples

**Handling WhatsApp Messages**
```typescript
// Send a message to WhatsApp user
await whatsAppService.sendWhatsAppMessage(
  userPhoneNumber,
  "Hello! How can I help you today?",
  messageId
);

// Mark message as read
await whatsAppService.markMessageAsRead(messageId);
```

**Managing User Context**
```typescript
// Save and fetch conversation context
const context = await userContextService.saveAndFetchContext(
  userInput,
  'user',
  userId
);
```

### Troubleshooting

**Common Issues**

1. WhatsApp Webhook Verification Fails
- Error: "Error verifying token"
- Solution:
  ```bash
  # Check webhook verification token
  echo $WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN
  # Ensure it matches the token in WhatsApp Cloud API settings
  ```

2. Redis Connection Issues
- Error: "Error Saving Context"
- Steps:
  1. Verify Redis connection:
  ```bash
  redis-cli ping
  ```
  2. Check Redis URL in environment variables
  3. Ensure Redis server is running:
  ```bash
  systemctl status redis
  ```

3. OpenAI API Issues
- Error: "Unable to process your request at the moment"
- Debug steps:
  1. Check API key validity
  2. Verify API endpoint configuration
  3. Enable debug logging:
  ```typescript
  this.logger.debug('OpenAI Request:', { input: userInput });
  ```

## Data Flow
The application processes messages through a chain of services, from WhatsApp webhook to AI response generation and back.

```ascii
WhatsApp API ─► Controller ─► WhatsApp Service ─► OpenAI Service
     ▲                                                  │
     │                                                  │
     └──────────── User Context Service ◄──────────────┘
                   (Redis Storage)
```

Key Component Interactions:
1. WhatsApp webhook receives incoming messages
2. Messages are processed by WhatsApp controller
3. User context is retrieved from Redis
4. OpenAI service generates responses using context
5. Responses are stored in context
6. Messages are sent back to WhatsApp
7. Message status is updated (read receipts)
8. All operations are logged for monitoring