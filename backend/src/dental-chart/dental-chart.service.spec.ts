import { Test, TestingModule } from '@nestjs/testing';
import { DentalChartService } from './dental-chart.service';

describe('DentalChartService', () => {
  let service: DentalChartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DentalChartService],
    }).compile();

    service = module.get<DentalChartService>(DentalChartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
