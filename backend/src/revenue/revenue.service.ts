import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

@Injectable()
export class RevenueService {
  private readonly pythonDataDir = path.join(
    process.cwd(),
    '..',
    'python',
    'data',
  );
  private readonly defaultXlsxPath = path.join(
    this.pythonDataDir,
    'Revenue_Report.xlsx',
  );
  private readonly pythonScriptForDaily = path.join(
    process.cwd(),
    '..',
    'python',
    'forecast_daily.py',
  );

  private readonly pythonScriptForMonthly = path.join(
    process.cwd(),
    '..',
    'python',
    'forecast_monthly.py',
  );

  // -----------------------------
  // Generate XLSX and run forecast
  // -----------------------------
  generateRevenueXlsxAndForecast(rows: any[]) {
    const xlsxPath = this.createRevenueXlsx(rows);
    const forecast = this.runDailyForecast(xlsxPath);

    return {
      message: 'Revenue XLSX generated and forecast updated',
      forecast,
      filePath: xlsxPath,
    };
  }

  // -----------------------------
  // Create XLSX only
  // -----------------------------
  createRevenueXlsx(rows: any[]): string {
    if (!fs.existsSync(this.pythonDataDir))
      fs.mkdirSync(this.pythonDataDir, { recursive: true });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue Report');

    XLSX.writeFile(workbook, this.defaultXlsxPath);
    return this.defaultXlsxPath;
  }

  // -----------------------------
  // Run Python forecast
  // -----------------------------
  runDailyForecast(xlsxPath?: string): any {
    const filePath = xlsxPath || this.defaultXlsxPath;

    if (!fs.existsSync(filePath)) {
      throw new Error(`XLSX file not found at path: ${filePath}`);
    }

    try {
      execSync(`python "${this.pythonScriptForDaily}" "${filePath}"`, {
        stdio: 'inherit',
      });
    } catch (err) {
      throw new Error('Python forecast script failed: ' + err.message);
    }

    const jsonPath = path.join(
      this.pythonDataDir,
      'revenue_forecast_daily.json',
    );
    if (!fs.existsSync(jsonPath)) throw new Error('Forecast JSON not found');

    const raw = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(raw);
  }

  runMonthlyForecast(xlsxPath?: string): any {
    const filePath = xlsxPath || this.defaultXlsxPath;

    if (!fs.existsSync(filePath)) {
      throw new Error(`XLSX file not found at path: ${filePath}`);
    }

    try {
      execSync(`python "${this.pythonScriptForMonthly}" "${filePath}"`, {
        stdio: 'inherit',
      });
    } catch (err) {
      throw new Error('Python forecast script failed: ' + err.message);
    }

    const jsonPath = path.join(
      this.pythonDataDir,
      'revenue_forecast_nextmonth.json',
    );
    if (!fs.existsSync(jsonPath)) throw new Error('Forecast JSON not found');

    const raw = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(raw);
  }
}
