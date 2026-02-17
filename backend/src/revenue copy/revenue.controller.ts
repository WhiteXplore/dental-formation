import { Controller, Post, Body } from '@nestjs/common';
import { RevenueService } from './revenue.service';

@Controller('revenue')
export class RevenueController {
  constructor(private readonly service: RevenueService) {}

  // Generate XLSX + Daily Forecast
  @Post('generate-xlsx')
  generateXlsx(@Body() rows: any[]) {
    return this.service.generateRevenueXlsxAndForecast(rows);
  }

  // Run Daily Forecast Only
  @Post('run-daily-forecast')
  runDailyForecast(@Body('xlsxPath') xlsxPath?: string) {
    return this.service.runDailyForecast(xlsxPath);
  }

  // Run Monthly Forecast Only
  @Post('run-monthly-forecast')
  runMonthlyForecast(@Body('xlsxPath') xlsxPath?: string) {
    return this.service.runMonthlyForecast(xlsxPath);
  }
}
