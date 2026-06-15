import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

@Injectable()
export class RevenueService {
  private readonly baseDir = path.resolve(__dirname, '../../..');

  private readonly pythonDir = path.join(this.baseDir, 'python');
  private readonly pythonDataDir = path.join(this.pythonDir, 'data');

private readonly pythonBin =
  process.platform === 'win32'
    ? path.join(this.pythonDir, 'venv', 'Scripts', 'python.exe')
    : path.join(this.pythonDir, 'venv', 'bin', 'python3');

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

  generateRevenueXlsxAndForecast(rows: any[]) {
    if (!rows || !rows.length) {
      throw new InternalServerErrorException(
        'No data available to generate forecast.',
      );
    }

    const xlsxPath = this.createRevenueXlsx(rows);
    const forecast = this.runDailyForecast(xlsxPath);

    return {
      message: 'Revenue XLSX generated and daily forecast completed',
      forecast,
      filePath: xlsxPath,
    };
  }

  createRevenueXlsx(rows: any[]): string {
    try {
      if (!rows || !rows.length) {
        throw new InternalServerErrorException(
          'No rows received from frontend.',
        );
      }

      if (!fs.existsSync(this.pythonDataDir)) {
        fs.mkdirSync(this.pythonDataDir, { recursive: true });
      }

      const cleanRows = rows.filter((row) => row && Object.keys(row).length);

      if (!cleanRows.length) {
        throw new InternalServerErrorException(
          'Rows are empty after filtering.',
        );
      }

      const worksheet = XLSX.utils.json_to_sheet(cleanRows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue Report');
      XLSX.writeFile(workbook, this.defaultXlsxPath);

      return this.defaultXlsxPath;
    } catch (err: any) {
      throw new InternalServerErrorException(
        err?.message || 'Failed to generate Revenue XLSX file',
      );
    }
  }

 runDailyForecast(xlsxPath?: string): any {
  const filePath = xlsxPath || this.defaultXlsxPath;

  this.validatePythonFiles(filePath, this.pythonScriptForDaily);

  try {
    console.log('PYTHON BIN:', this.pythonBin);
    console.log('PYTHON EXISTS:', fs.existsSync(this.pythonBin));
    console.log('PYTHON SCRIPT:', this.pythonScriptForDaily);
    console.log('XLSX PATH:', filePath);

    execFileSync(this.pythonBin, [this.pythonScriptForDaily, filePath], {
      stdio: 'pipe',
      windowsHide: true,
    });
  } catch (err: any) {
    console.error('🐍 Daily PYTHON STDOUT:', err?.stdout?.toString());
    console.error('🐍 Daily PYTHON STDERR:', err?.stderr?.toString());

    throw new InternalServerErrorException(
      err?.stderr?.toString() ||
        err?.stdout?.toString() ||
        'Python daily forecast failed',   
    );
  }

  const jsonPath = path.join(this.pythonDataDir, 'revenue_forecast_daily.json');

  if (!fs.existsSync(jsonPath)) {
    throw new InternalServerErrorException('Daily forecast JSON not generated');
  }

  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

  runMonthlyForecast(xlsxPath?: string): any {
  const filePath = xlsxPath || this.defaultXlsxPath;

  this.validatePythonFiles(filePath, this.pythonScriptForMonthly);

  try {
    console.log('PYTHON BIN:', this.pythonBin);
    console.log('PYTHON EXISTS:', fs.existsSync(this.pythonBin));
    console.log('PYTHON SCRIPT:', this.pythonScriptForMonthly);
    console.log('XLSX PATH:', filePath);

    execFileSync(this.pythonBin, [this.pythonScriptForMonthly, filePath], {
      stdio: 'pipe',
      windowsHide: true,
    });
  } catch (err: any) {
    console.error('🐍 Monthly PYTHON STDOUT:', err?.stdout?.toString());
    console.error('🐍 Monthly PYTHON STDERR:', err?.stderr?.toString());

    throw new InternalServerErrorException(
      err?.stderr?.toString() ||
        err?.stdout?.toString() ||
        'Python monthly forecast failed',
    );
  }

  const jsonPath = path.join(
    this.pythonDataDir,
    'revenue_forecast_nextmonth.json',
  );

  console.log('MONTHLY JSON PATH:', jsonPath);
  console.log('MONTHLY JSON EXISTS:', fs.existsSync(jsonPath));

  if (!fs.existsSync(jsonPath)) {
    throw new InternalServerErrorException(
      'Monthly forecast JSON not generated',
    );
  }

  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

  private validatePythonFiles(xlsxPath: string, scriptPath: string) {
    if (!fs.existsSync(this.pythonBin)) {
      throw new InternalServerErrorException(
        `Python executable not found: ${this.pythonBin}`,
      );
    }

    if (!fs.existsSync(xlsxPath)) {
      throw new InternalServerErrorException(`XLSX file not found: ${xlsxPath}`);
    }

    if (!fs.existsSync(scriptPath)) {
      throw new InternalServerErrorException(
        `Python script not found: ${scriptPath}`,
      );
    }
  }
}