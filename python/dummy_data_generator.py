import pandas as pd
import random
from datetime import datetime, timedelta

# -----------------------------
# Config
# -----------------------------
START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 4, 30)

MIN_PROCEDURES_PER_DAY = 3
MAX_PROCEDURES_PER_DAY = 6

PATIENTS = [
    "Gretchen B. Olivar",
    "Juan Dela Cruz",
    "Maria Santos",
    "Pedro Reyes",
    "Ana Lopez",
]

DENTISTS = [
    "Sigfred Navasquez",
    "John Molina",
    "Karen Flores",
]

PROCEDURES = [
    ("Extraction", "Basic Procedure", 800),
    ("Cleaning", "Basic Procedure", 500),
    ("Filling", "Basic Procedure", 1200),
    ("Root Canal", "Special Case", 5000),
    ("Crown", "Special Case", 8000),
]

# -----------------------------
# Generate Dates
# -----------------------------
date_range = [
    START_DATE + timedelta(days=i)
    for i in range((END_DATE - START_DATE).days + 1)
]

rows = []

# -----------------------------
# Generate Data (3+ revenue per day)
# -----------------------------
for date in date_range:
    procedures_today = random.randint(
        MIN_PROCEDURES_PER_DAY, MAX_PROCEDURES_PER_DAY
    )

    for _ in range(procedures_today):
        procedure_name, procedure_type, base_price = random.choice(PROCEDURES)
        procedure_count = random.randint(1, 4)

        total_payment = base_price * procedure_count

        if procedure_type == "Basic Procedure":
            clinic_share = total_payment * 0.6
            dentist_share = total_payment * 0.4
        else:
            clinic_share = total_payment * 0.5
            dentist_share = total_payment * 0.5

        rows.append({
            "Procedure Date": date.strftime("%Y-%m-%d"),
            "Patient Full Name": random.choice(PATIENTS),
            "Dentist": random.choice(DENTISTS),
            "Procedure": f"{procedure_name} - {procedure_count}",
            "Procedure Type": procedure_type,
            "Patient Payment": round(total_payment, 2),
            "Clinic Share": round(clinic_share, 2),
            "Dentist Share": round(dentist_share, 2),
        })

# -----------------------------
# Save to Excel
# -----------------------------
df = pd.DataFrame(rows)

output_path = "data/Dummy_Revenue_Report.xlsx"
df.to_excel(output_path, index=False)

print(f"✅ Dummy data generated with ≥3 revenue per day: {output_path}")
print(df.head())
print("\nRecords per day (sample):")
print(df.groupby("Procedure Date").size().head())
