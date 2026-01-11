import { Controller, Get } from '@nestjs/common';
import { ForecastService } from './forecast.service';

@Controller('analytics/revenue')
export class ForecastController {
  constructor(private readonly service: ForecastService) {}

  @Get('forecast')
  getForecast() {
    return {
      status: 'success',
      description:
        'Clinic revenue forecast using SARIMA + ML residual correction',
      data: this.service.getRevenueForecast(),
    };
  }
}
