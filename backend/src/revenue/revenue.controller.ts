import { Controller, Post, Body } from '@nestjs/common';
import { RevenueService } from './revenue.service';

@Controller('revenue')
export class RevenueController {
  constructor(private readonly service: RevenueService) {}

  @Post('generate-xlsx')
  generateXlsx(@Body() rows: any[]) {
    return this.service.generateRevenueXlsxAndForecast(rows);
  }
}
