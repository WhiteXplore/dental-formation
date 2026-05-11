import sys
import json
import pandas as pd
from pathlib import Path

# ----------------------------
# Load file
# ----------------------------
DATA_PATH = Path(sys.argv[1]) if len(
    sys.argv) >= 2 else Path("data/Revenue_Report.xlsx")
if not DATA_PATH.exists():
    raise FileNotFoundError(f"Revenue report not found: {DATA_PATH}")

if DATA_PATH.suffix == ".json":
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        df = pd.DataFrame(json.load(f))
else:
    df = pd.read_excel(DATA_PATH)

# ----------------------------
# Clean data
# ----------------------------
for col in ["Clinic Share", "Patient Payment", "Dentist Share"]:
    df[col] = df[col].replace(",", "", regex=True).astype(float)

df["Procedure Date"] = pd.to_datetime(df["Procedure Date"], errors="coerce")
df = df.dropna(subset=["Procedure Date"])
df = df.sort_values("Procedure Date")

# ----------------------------
# Monthly aggregation
# ----------------------------
monthly_revenue = df.groupby(
    pd.Grouper(key="Procedure Date", freq="ME")
)["Clinic Share"].sum()

history_len = len(monthly_revenue)
if history_len == 0:
    raise ValueError("No monthly revenue data available")

last_month_value = float(monthly_revenue.iloc[-1])

# ----------------------------
# ✅ Naive Forecast (1-month ahead)
# ----------------------------
forecast_value = last_month_value
forecast_month = monthly_revenue.index[-1] + pd.DateOffset(months=1)

forecast_df = pd.DataFrame({
    "month": [forecast_month.strftime("%Y-%m")],
    "forecast": [forecast_value],
    "method": ["Naive (Last Month Value)"]
})

# ----------------------------
# Save Excel
# ----------------------------
forecast_excel_path = DATA_PATH.parent / "Revenue_Forecast_NextMonth.xlsx"
forecast_df.to_excel(forecast_excel_path, index=False)

# ----------------------------
# Historical JSON
# ----------------------------
historical_df = monthly_revenue.reset_index()
historical_df.columns = ["month", "clinic_share"]
historical_df["month"] = historical_df["month"].dt.strftime("%Y-%m")

# ----------------------------
# Confidence (data-driven)
# ----------------------------
if history_len < 3:
    confidence_level = "LOW"
    confidence_score = 0.25
elif history_len < 6:
    confidence_level = "MEDIUM"
    confidence_score = 0.5
else:
    confidence_level = "HIGH"
    confidence_score = 0.75

confidence_reason = (
    f"{history_len} months of historical data available; "
)

# ----------------------------
# Validation (honest, no fake accuracy)
# ----------------------------
validation = {
    "accuracy_available": False,
    "reason": "No completed forecast vs actual cycles yet",
    "minimum_months_required": 1,
    "historical_months_available": history_len
}

# ----------------------------
# API Payload
# ----------------------------
api_payload = {
    "model": "Naive Baseline Forecast",
    "methodology": "Last observed monthly revenue is used as the next month forecast",
    "forecast_months": 1,
    "generated_at": pd.Timestamp.now().isoformat(),

    "forecast_confidence": {
        "level": confidence_level,
        "score": confidence_score,
        "reason": confidence_reason
    },

    "validation": validation,

    "historical": historical_df.to_dict(orient="records"),
    "forecast": forecast_df.to_dict(orient="records"),

    "summary": {
        "last_month_actual": last_month_value,
        "next_month_forecast": forecast_value,
        "difference": 0.0
    }
}

# ----------------------------
# Save JSON
# ----------------------------
json_path = DATA_PATH.parent / "revenue_forecast_nextmonth.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(api_payload, f, indent=2)

print(f" Next month forecast JSON generated at {json_path}")
print(f" Excel saved at {forecast_excel_path}")
