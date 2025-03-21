import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class AmadeusService {
  private readonly logger = new Logger(AmadeusService.name);
  private accessToken: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Gets an Amadeus API access token or returns a cached one if still valid
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if it's still valid
    if (this.accessToken && this.tokenExpiration && this.tokenExpiration > new Date()) {
      return this.accessToken;
    }

    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('Amadeus API credentials not configured');
    }

    try {
      const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', apiKey);
      params.append('client_secret', apiSecret);

      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }).pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            this.logger.error('Error authenticating with Amadeus API', error.response?.data);
            throw new Error('Failed to authenticate with Amadeus API');
          }),
        ),
      );

      this.accessToken = response.access_token;
      // Calculate expiration time based on expires_in (seconds)
      this.tokenExpiration = new Date(Date.now() + (response.expires_in * 1000));
      
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get Amadeus access token', error);
      throw error;
    }
  }

  /**
   * Search for flight offers
   */
  async searchFlightOffers(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    adults: number;
    max?: number;
    returnDate?: string;
    children?: number;
    infants?: number;
    travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    includedAirlineCodes?: string;
    excludedAirlineCodes?: string;
    nonStop?: boolean;
    currencyCode?: string;
    maxPrice?: number;
  }) {
    try {
      const token = await this.getAccessToken();
      console.log('Token:', token);
      
      const apiUrl = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
      
      const response = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        }).pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            this.logger.error('Error searching flight offers', error.response?.data);
            throw new Error(`Failed to search flight offers: ${error.message}`);
          }),
        ),
      );
      
      return "the offer search result returned";
    } catch (error) {
      this.logger.error('Flight search error', error);
      throw error;
    }
  }
}