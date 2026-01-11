import { Injectable } from '@nestjs/common'; import * as XLSX from 'xlsx';
import * as fs from 'fs'; import * as path from 'path'; import { execSync } from
'child_process'; @Injectable() export class RevenueService {
generateRevenueXlsxAndForecast(rows: any[]) { // -----------------------------
// 1️⃣ Save XLSX // ----------------------------- const worksheet =
XLSX.utils.json_to_sheet(rows); const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue Report'); const
pythonDataDir = path.join(process.cwd(), '..', 'python', 'data'); if
(!fs.existsSync(pythonDataDir)) fs.mkdirSync(pythonDataDir, { recursive: true
}); const filePath = path.join(pythonDataDir, 'Revenue_Report.xlsx');
XLSX.writeFile(workbook, filePath); // ----------------------------- // 2️⃣ Run
Python forecast.py // ----------------------------- const pythonScript =
path.join(process.cwd(), '..', 'python', 'forecast.py'); try { execSync(`python
"${pythonScript}"`, { stdio: 'inherit' }); } catch (err) { throw new
Error('Python forecast script failed: ' + err.message); } //
----------------------------- // 3️⃣ Read generated JSON //
----------------------------- const jsonPath = path.join(pythonDataDir,
'revenue_forecast.json'); if (!fs.existsSync(jsonPath)) throw new
Error('Forecast JSON not found'); const raw = fs.readFileSync(jsonPath, 'utf8');
const forecast = JSON.parse(raw); return { message: 'Revenue XLSX generated and
forecast updated', forecast, filePath, }; } }
