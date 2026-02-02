import sys
import json
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.ensemble import RandomForestRegressor
from pathlib import Path

# ----------------------------
# Get XLSX path from argument
# ----------------------------
if len(sys.argv) < 2:
    raise ValueError(
        "Please provide the path to Revenue_Report.xlsx as the first argument.")

DATA_PATH = Path(sys.argv[1])
if not DATA_PATH.exists():
    raise FileNotFoundError(f"Revenue report file not found: {DATA_PATH}")

# ----------------------------
# Load Data
# ----------------------------
df = pd.read_excel(DATA_PATH)

for col in ["Clinic Share", "Patient Payment", "Dentist Share"]:
    df[col] = df[col].replace(",", "", regex=True).astype(float)

# Convert mixed date formats safely
df["Procedure Date"] = pd.to_datetime(
    df["Procedure Date"], errors="coerce", utc=True
).dt.normalize()
df = df.sort_values("Procedure Date")

# ----------------------------
# Aggregate Daily Revenue
# ----------------------------
# i disable interpolation here
# daily_revenue = (
#     df.groupby("Procedure Date")["Clinic Share"]
#     .sum()
#     .asfreq("D")
#     .interpolate(method="linear")
# )

daily_revenue = df.groupby("Procedure Date")["Clinic Share"].sum()


# ----------------------------
# SARIMA Model
# ----------------------------
sarima = SARIMAX(
    daily_revenue,
    order=(1, 1, 1),
    seasonal_order=(1, 1, 1, 7),
    enforce_stationarity=False,
    enforce_invertibility=False
)
sarima_fit = sarima.fit(disp=False)
sarima_forecast = sarima_fit.forecast(steps=7)

# ----------------------------
# Residuals
# ----------------------------
residuals = daily_revenue - sarima_fit.fittedvalues

# ----------------------------
# Feature Engineering
# ----------------------------
features = pd.DataFrame({
    "lag_1": daily_revenue.shift(1),
    "lag_2": daily_revenue.shift(2),
    # Remove lag_3 or rolling_7 if too many NaNs
    "rolling_3": daily_revenue.rolling(3, min_periods=1).mean(),
    "day_of_week": daily_revenue.index.dayofweek
})
data = pd.concat([features, residuals.rename("residual")], axis=1).dropna()

X = data.drop(columns="residual")
y = data["residual"]

# ----------------------------
# Train Random Forest
# ----------------------------
split = int(len(X) * 0.8)
rf = RandomForestRegressor(n_estimators=300, max_depth=10, random_state=42)
rf.fit(X.iloc[:split], y.iloc[:split])

# ----------------------------
# Predict Residuals (simple correction)
# ----------------------------
future_residuals = np.repeat(rf.predict(X.iloc[[-1]])[0], 7)

# ----------------------------
# Final Hybrid Forecast
# ----------------------------
hybrid_forecast = sarima_forecast.values + future_residuals

forecast_index = pd.date_range(
    daily_revenue.index[-1] + pd.Timedelta(days=1),
    periods=7
)
forecast_df = pd.DataFrame({
    "date": forecast_index.astype(str),
    "sarima_forecast": sarima_forecast.values,
    "hybrid_forecast": hybrid_forecast,
})
forecast_df["difference"] = forecast_df["hybrid_forecast"] - \
    forecast_df["sarima_forecast"]
forecast_df["absolute_difference"] = forecast_df["difference"].abs()

# ----------------------------
# Save Excel
# ----------------------------
forecast_excel_path = DATA_PATH.parent / "Revenue_Forecast_Final.xlsx"
forecast_df.to_excel(forecast_excel_path, index=False)

# ----------------------------
# ✅ Safe JSON export
# ----------------------------
historical_df = daily_revenue.reset_index().rename(
    columns={"Procedure Date": "date"})
historical_df["date"] = historical_df["date"].astype(str)

api_payload = {
    "model": "Hybrid SARIMA + RandomForest",
    "seasonality": "Weekly",
    "forecast_days": 7,
    "generated_at": pd.Timestamp.now().isoformat(),
    "historical": historical_df.to_dict(orient="records"),
    "forecast": forecast_df.to_dict(orient="records"),
    "summary": {
        "avg_sarima": float(forecast_df["sarima_forecast"].mean()),
        "avg_hybrid": float(forecast_df["hybrid_forecast"].mean()),
        "avg_difference": float(forecast_df["difference"].mean()),
        "max_expected_revenue": float(forecast_df["hybrid_forecast"].max()),
    }
}

json_path = DATA_PATH.parent / "revenue_forecast.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(api_payload, f, indent=2)

print(f"✅ Forecast JSON successfully generated at {json_path}")
