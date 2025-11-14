import { Test, TestingModule } from '@nestjs/testing';
import { PriceProcedureController } from './price-procedure.controller';
import { PriceProcedureService } from './price-procedure.service';

describe('PriceProcedureController', () => {
  let controller: PriceProcedureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceProcedureController],
      providers: [PriceProcedureService],
    }).compile();

    controller = module.get<PriceProcedureController>(PriceProcedureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
