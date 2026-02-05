import sys
import json
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.ensemble import RandomForestRegressor
from pathlib import Path

# Accept path from Node.js
DATA_PATH = Path(sys.argv[1]) if len(
    sys.argv) >= 2 else Path("data/Revenue_Report.xlsx")
if not DATA_PATH.exists():
    raise FileNotFoundError(f"Revenue report not found: {DATA_PATH}")

# Load JSON or Excel
if DATA_PATH.suffix == ".json":
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        df = pd.DataFrame(json.load(f))
else:
    df = pd.read_excel(DATA_PATH)

# Ensure numeric columns
for col in ["Clinic Share", "Patient Payment", "Dentist Share"]:
    df[col] = df[col].replace(",", "", regex=True).astype(float)

# Parse dates
df["Procedure Date"] = pd.to_datetime(df["Procedure Date"], errors="coerce")
df = df.sort_values("Procedure Date")

# Aggregate monthly revenue
monthly_revenue = df.groupby(
    pd.Grouper(key="Procedure Date", freq="M")
)["Clinic Share"].sum()

# ----------------------------
# SARIMA Model (Monthly)
# ----------------------------
sarima = SARIMAX(
    monthly_revenue,
    order=(1, 1, 1),
    seasonal_order=(1, 1, 1, 12),
    enforce_stationarity=False,
    enforce_invertibility=False
)
sarima_fit = sarima.fit(disp=False)

# 🔥 Forecast NEXT 1 MONTH ONLY
sarima_forecast = sarima_fit.forecast(steps=1)

# Residuals
residuals = monthly_revenue - sarima_fit.fittedvalues

# Feature engineering
features = pd.DataFrame({
    "lag_1": monthly_revenue.shift(1),
    "lag_2": monthly_revenue.shift(2),
    "rolling_3": monthly_revenue.rolling(3, min_periods=1).mean(),
    "month": monthly_revenue.index.month,
    "quarter": monthly_revenue.index.quarter
})

data = pd.concat([features, residuals.rename("residual")], axis=1).dropna()
X = data.drop(columns="residual")
y = data["residual"]

# Train Random Forest
split = int(len(X) * 0.8)
rf = RandomForestRegressor(
    n_estimators=300,
    max_depth=10,
    random_state=42
)
rf.fit(X.iloc[:split], y.iloc[:split])

# ----------------------------
# Hybrid forecast for NEXT 1 MONTH
# ----------------------------
last_known = monthly_revenue.iloc[-2:].tolist()

lag_1 = last_known[-1]
lag_2 = last_known[-2]
rolling_3 = np.mean([lag_2, lag_1, lag_1])

next_month_date = monthly_revenue.index[-1] + pd.DateOffset(months=1)

feat = pd.DataFrame({
    "lag_1": [lag_1],
    "lag_2": [lag_2],
    "rolling_3": [rolling_3],
    "month": [next_month_date.month],
    "quarter": [next_month_date.quarter]
})

pred_residual = rf.predict(feat)[0]
hybrid_forecast = sarima_forecast.values[0] + pred_residual

# Forecast index
forecast_index = pd.date_range(
    monthly_revenue.index[-1] + pd.offsets.MonthEnd(),
    periods=1,
    freq="M"
)

# Forecast DataFrame
forecast_df = pd.DataFrame({
    "month": forecast_index.strftime("%Y-%m"),
    "sarima_forecast": sarima_forecast.values,
    "hybrid_forecast": [hybrid_forecast]
})

forecast_df["difference"] = (
    forecast_df["hybrid_forecast"] - forecast_df["sarima_forecast"]
)
forecast_df["absolute_difference"] = forecast_df["difference"].abs()

# Save Excel
forecast_excel_path = DATA_PATH.parent / "Revenue_Forecast_NextMonth.xlsx"
forecast_df.to_excel(forecast_excel_path, index=False)

# Historical JSON
historical_df = monthly_revenue.reset_index().rename(
    columns={"Procedure Date": "month"}
)
historical_df["month"] = historical_df["month"].dt.strftime("%Y-%m")

# API Payload
api_payload = {
    "model": "Hybrid SARIMA + RandomForest",
    "seasonality": "Yearly (Monthly data)",
    "forecast_months": 1,
    "generated_at": pd.Timestamp.now().isoformat(),
    "historical": historical_df.to_dict(orient="records"),
    "forecast": forecast_df.to_dict(orient="records"),
    "summary": {
        "sarima_next_month": float(forecast_df["sarima_forecast"].iloc[0]),
        "hybrid_next_month": float(forecast_df["hybrid_forecast"].iloc[0]),
        "difference": float(forecast_df["difference"].iloc[0])
    }
}

json_path = DATA_PATH.parent / "revenue_forecast_nextmonth.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(api_payload, f, indent=2)

print(f"✅ Next month forecast JSON generated at {json_path}")
print(f"✅ Excel saved at {forecast_excel_path}")
