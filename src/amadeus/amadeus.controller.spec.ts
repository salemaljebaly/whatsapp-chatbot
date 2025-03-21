import { Test, TestingModule } from '@nestjs/testing';
import { AmadeusController } from './amadeus.controller';
import { AmadeusService } from './amadeus.service';

describe('AmadeusController', () => {
  let controller: AmadeusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmadeusController],
      providers: [AmadeusService],
    }).compile();

    controller = module.get<AmadeusController>(AmadeusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
