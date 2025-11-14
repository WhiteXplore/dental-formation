import { Test, TestingModule } from '@nestjs/testing';
import { PrescribeMedicationService } from './prescribe-medication.service';

describe('PrescribeMedicationService', () => {
  let service: PrescribeMedicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrescribeMedicationService],
    }).compile();

    service = module.get<PrescribeMedicationService>(PrescribeMedicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
