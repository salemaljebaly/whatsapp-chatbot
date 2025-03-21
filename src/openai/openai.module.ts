import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { UserContextService } from 'src/user-context/user-context.service';
import { AmadeusService } from 'src/amadeus/amadeus.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [OpenaiService, UserContextService, AmadeusService],
})
export class OpenaiModule {}