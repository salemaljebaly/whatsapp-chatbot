import { Controller, Get, Query, Logger } from '@nestjs/common';
import { AmadeusService } from './amadeus.service';

@Controller('amadeus')
export class AmadeusController {
  private readonly logger = new Logger(AmadeusController.name);

  constructor(private readonly amadeusService: AmadeusService) {}

  @Get('flight-offers')
  async searchFlightOffers(
    @Query('originLocationCode') originLocationCode: string,
    @Query('destinationLocationCode') destinationLocationCode: string,
    @Query('departureDate') departureDate: string,
    @Query('adults') adults: number,
    @Query('max') max?: number,
    @Query('returnDate') returnDate?: string,
    @Query('children') children?: number,
    @Query('infants') infants?: number,
    @Query('travelClass') travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST',
    @Query('includedAirlineCodes') includedAirlineCodes?: string,
    @Query('excludedAirlineCodes') excludedAirlineCodes?: string,
    @Query('nonStop') nonStop?: boolean,
    @Query('currencyCode') currencyCode?: string,
    @Query('maxPrice') maxPrice?: number,
  ) {
    this.logger.log(`Searching flights from ${originLocationCode} to ${destinationLocationCode}`);
    
    try {
      const result = await this.amadeusService.searchFlightOffers({
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults: Number(adults) || 1,
        max: max ? Number(max) : undefined,
        returnDate,
        children: children ? Number(children) : undefined,
        infants: infants ? Number(infants) : undefined,
        travelClass,
        includedAirlineCodes,
        excludedAirlineCodes,
        nonStop,
        currencyCode,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error searching flight offers', error);
      throw error;
    }
  }
}