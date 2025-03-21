import { Module } from '@nestjs/common';
import { AmadeusService } from './amadeus.service';
import { AmadeusController } from './amadeus.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AmadeusController],   
  providers: [AmadeusService],
  exports: [AmadeusService],
})
export class AmadeusModule {}
