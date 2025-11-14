import { Test, TestingModule } from '@nestjs/testing';
import { PriceProcedureService } from './price-procedure.service';

describe('PriceProcedureService', () => {
  let service: PriceProcedureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceProcedureService],
    }).compile();

    service = module.get<PriceProcedureService>(PriceProcedureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
