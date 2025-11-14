import { Test, TestingModule } from '@nestjs/testing';
import { PrescribeMedicationController } from './prescribe-medication.controller';
import { PrescribeMedicationService } from './prescribe-medication.service';

describe('PrescribeMedicationController', () => {
  let controller: PrescribeMedicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescribeMedicationController],
      providers: [PrescribeMedicationService],
    }).compile();

    controller = module.get<PrescribeMedicationController>(PrescribeMedicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
