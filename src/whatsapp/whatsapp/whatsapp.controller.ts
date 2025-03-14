import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import * as process from 'node:process';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsAppService: WhatsappService) {}
  private readonly logger = new Logger(WhatsappController.name);

  @Get('webhook')
  whatsappVerificationChallenge(@Req() request: Request) {
    const mode = request.query['hub.mode'];
    const challenge = request.query['hub.challenge'];
    const token = request.query['hub.verify_token'];

    const verificationToken =
      process.env.WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN;

    this.logger.debug('Verification challenge received', {
      mode,
      token: token ? '[PRESENT]' : '[MISSING]',
      expected: verificationToken ? '[PRESENT]' : '[MISSING]'
    });

    if (!mode || !token) {
      return 'Error verifying token';
    }

    if (mode === 'subscribe' && token === verificationToken) {
      this.logger.log('Webhook verified successfully');
      return challenge?.toString();
    } else {
      this.logger.warn('Webhook verification failed');
      return 'Error verifying token';
    }
  }

  @Post('webhook')
  @HttpCode(200)
  async handleIncomingWhatsappMessage(@Body() request: any) {
    try {
      this.logger.debug('Received WhatsApp webhook payload');
      
      const { messages } = request?.entry?.[0]?.changes?.[0].value ?? {};
      if (!messages) {
        this.logger.debug('No messages in webhook payload');
        return 'No messages to process';
      }

      const message = messages[0];
      this.logger.debug('Processing message', { id: message.id, type: message.type });
      
      const messageSender = message.from;
      const messageID = message.id;
      
      // Try to mark the message as read
      try {
        await this.whatsAppService.markMessageAsRead(messageID);
      } catch (error) {
        this.logger.error('Failed to mark message as read but continuing', { id: messageID });
      }

      switch (message.type) {
        case 'text':
          const text = message.text.body;
          this.logger.debug('Processing text message', { from: messageSender, text });
          
          try {
            await this.whatsAppService.sendWhatsAppMessage(
              messageSender,
              text,
              messageID,
            );
          } catch (error) {
            this.logger.error('Failed to send response message', error);
          }
          break;
          
        default:
          this.logger.warn('Unsupported message type', { type: message.type });
          break;
      }

      return 'Message processed';
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      // Always return 200 OK to WhatsApp to acknowledge receipt
      return 'Error processing message';
    }
  }
}