import { Controller, Post, Body } from '@nestjs/common';
import { RevenueService } from './revenue.service';

@Controller('revenue')
export class RevenueController {
  constructor(private readonly service: RevenueService) {}

  // Generate XLSX and run forecast
  @Post('generate-xlsx')
  generateXlsx(@Body() rows: any[]) {
    return this.service.generateRevenueXlsxAndForecast(rows);
  }

  // Run forecast only
  @Post('run-daily-forecast')
  runDailyForecast(@Body('xlsxPath') xlsxPath?: string) {
    return this.service.runDailyForecast(xlsxPath);
  }

  @Post('run-monthly-forecast')
  runMonthlyForecast(@Body('xlsxPath') xlsxPath?: string) {
    return this.service.runMonthlyForecast(xlsxPath);
  }
}
