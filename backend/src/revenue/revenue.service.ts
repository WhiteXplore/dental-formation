import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

@Injectable()
export class RevenueService {
  // Base directory (compiled dist -> project root)
  private readonly baseDir = path.resolve(__dirname, '../../..');

  // Python paths
  private readonly pythonDir = path.join(this.baseDir, 'python');
  private readonly pythonDataDir = path.join(this.pythonDir, 'data');

  // Path to virtual environment Python
  private readonly pythonBin = path.join(
    this.pythonDir,
    'venv',
    'bin',
    'python3',
  );

  // Default XLSX and scripts
  private readonly defaultXlsxPath = path.join(
    this.pythonDataDir,
    'Revenue_Report.xlsx',
  );
  private readonly pythonScriptForDaily = path.join(
    this.pythonDir,
    'forecast_daily.py',
  );
  private readonly pythonScriptForMonthly = path.join(
    this.pythonDir,
    'forecast_monthly.py',
  );

  // -----------------------------
  // Generate XLSX + Daily Forecast
  // -----------------------------
  generateRevenueXlsxAndForecast(rows: any[]) {
    const xlsxPath = this.createRevenueXlsx(rows);
    const forecast = this.runDailyForecast(xlsxPath);

    return {
      message: 'Revenue XLSX generated and daily forecast completed',
      forecast,
      filePath: xlsxPath,
    };
  }

  // -----------------------------
  // Create XLSX
  // -----------------------------
  createRevenueXlsx(rows: any[]): string {
    try {
      if (!fs.existsSync(this.pythonDataDir)) {
        fs.mkdirSync(this.pythonDataDir, { recursive: true });
      }

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue Report');

      XLSX.writeFile(workbook, this.defaultXlsxPath);
      return this.defaultXlsxPath;
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to generate Revenue XLSX file',
      );
    }
  }

  // -----------------------------
  // Run Daily Forecast (venv Python)
  // -----------------------------
  runDailyForecast(xlsxPath?: string): any {
    const filePath = xlsxPath || this.defaultXlsxPath;

    if (!fs.existsSync(filePath))
      throw new InternalServerErrorException(
        `XLSX file not found: ${filePath}`,
      );

    if (!fs.existsSync(this.pythonScriptForDaily))
      throw new InternalServerErrorException(
        `Python script not found: ${this.pythonScriptForDaily}`,
      );

    try {
      execSync(
        `"${this.pythonBin}" "${this.pythonScriptForDaily}" "${filePath}"`,
        { stdio: 'pipe' }, // capture stdout/stderr
      );
    } catch (err: any) {
      console.error('🐍 PYTHON STDOUT:', err?.stdout?.toString());
      console.error('🐍 PYTHON STDERR:', err?.stderr?.toString());
      throw new InternalServerErrorException(
        err?.stderr?.toString() || 'Python daily forecast failed',
      );
    }

    const jsonPath = path.join(
      this.pythonDataDir,
      'revenue_forecast_daily.json',
    );

    if (!fs.existsSync(jsonPath))
      throw new InternalServerErrorException(
        'Daily forecast JSON not generated',
      );

    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  // -----------------------------
  // Run Monthly Forecast (venv Python)
  // -----------------------------
  runMonthlyForecast(xlsxPath?: string): any {
    const filePath = xlsxPath || this.defaultXlsxPath;

    if (!fs.existsSync(filePath))
      throw new InternalServerErrorException(
        `XLSX file not found: ${filePath}`,
      );

    if (!fs.existsSync(this.pythonScriptForMonthly))
      throw new InternalServerErrorException(
        `Python script not found: ${this.pythonScriptForMonthly}`,
      );

    try {
      execSync(
        `"${this.pythonBin}" "${this.pythonScriptForMonthly}" "${filePath}"`,
        { stdio: 'pipe' },
      );
    } catch (err: any) {
      console.error('🐍 PYTHON STDOUT:', err?.stdout?.toString());
      console.error('🐍 PYTHON STDERR:', err?.stderr?.toString());
      throw new InternalServerErrorException(
        err?.stderr?.toString() || 'Python monthly forecast failed',
      );
    }

    const jsonPath = path.join(
      this.pythonDataDir,
      'revenue_forecast_nextmonth.json',
    );

    if (!fs.existsSync(jsonPath))
      throw new InternalServerErrorException(
        'Monthly forecast JSON not generated',
      );

    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
}
