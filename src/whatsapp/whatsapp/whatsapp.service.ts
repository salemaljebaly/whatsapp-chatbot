import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class WhatsappService {
  constructor(private readonly openaiService: OpenaiService) {}

  private readonly httpService = new HttpService();
  private readonly logger = new Logger(WhatsappService.name);
  private readonly baseUrl = `https://graph.facebook.com/${process.env.WHATSAPP_CLOUD_API_VERSION}`;
  private readonly phoneNumberId = process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID;

  async sendWhatsAppMessage(
    messageSender: string,
    userInput: string,
    messageID: string,
  ) {
    try {
      const aiResponse = await this.openaiService.generateAIResponse(
        messageSender,
        userInput,
      );

      // Create a fresh URL and config for each request
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      // Create fresh config with current token
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_CLOUD_API_ACCESS_TOKEN}`,
        },
      };

      // Debug log
      this.logger.debug('WhatsApp API Request to URL:', url);
      this.logger.debug('Using Phone Number ID:', this.phoneNumberId);

      const data = JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: messageSender,
        context: {
          message_id: messageID,
        },
        type: 'text',
        text: {
          preview_url: false,
          body: aiResponse,
        },
      });

      // Debug log the request body (but mask sensitive info)
      this.logger.debug('Request payload:', {
        to: messageSender,
        context: { message_id: messageID },
      });

      const response = await lastValueFrom(
        this.httpService.post(url, data, config).pipe(
          map((res) => {
            return res.data;
          }),
          catchError((error) => {
            this.logger.error('WhatsApp API Error:', error.message);
            this.logger.error('Error details:', JSON.stringify(error.response?.data || {}));
            throw new BadRequestException(
              'Error Posting To WhatsApp Cloud API',
            );
          }),
        )
      );

      this.logger.log('Message Sent. Status:', JSON.stringify(response));
      return response;
    } catch (error) {
      this.logger.error('Failed to send WhatsApp message:', error.message);
      return 'Axle broke!! Abort mission!!';
    }
  }

  async markMessageAsRead(messageID: string) {
    try {
      // Create a fresh URL and config for each request
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      // Create fresh config with current token
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_CLOUD_API_ACCESS_TOKEN}`,
        },
      };

      const data = JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageID,
      });

      // Debug log
      this.logger.debug('Marking message as read:', messageID);

      const response = await lastValueFrom(
        this.httpService.post(url, data, config).pipe(
          map((res) => {
            return res.data;
          }),
          catchError((error) => {
            this.logger.error('Error marking message as read:', error.message);
            this.logger.error('Error details:', JSON.stringify(error.response?.data || {}));
            throw new BadRequestException('Error Marking Message As Read');
          }),
        )
      );

      this.logger.log('Message Marked As Read. Status:', JSON.stringify(response));
      return response;
    } catch (error) {
      this.logger.error('Failed to mark message as read:', error.message);
      return 'Axle broke!! Abort mission!!';
    }
  }
}