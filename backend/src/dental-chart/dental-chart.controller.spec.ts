import { Test, TestingModule } from '@nestjs/testing';
import { DentalChartController } from './dental-chart.controller';
import { DentalChartService } from './dental-chart.service';

describe('DentalChartController', () => {
  let controller: DentalChartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DentalChartController],
      providers: [DentalChartService],
    }).compile();

    controller = module.get<DentalChartController>(DentalChartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
