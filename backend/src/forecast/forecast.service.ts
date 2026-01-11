import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ForecastService {
  getRevenueForecast() {
    const filePath = path.resolve(
      __dirname,
      '../../../python/data/revenue_forecast.json',
    );

    if (!fs.existsSync(filePath)) {
      throw new Error('Revenue forecast file not found');
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  }
}
