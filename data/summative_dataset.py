import pandas as pd

data = pd.read_parquet("green_tripdata_2025-01.parquet")

# Clean congestion fee values
data.loc[data["congestion_surcharge"] < 0, "congestion_surcharge"] = 0.0
data.loc[data["cbd_congestion_fee"] < 0, "cbd_congestion_fee"] = 0.0

# Handle missing values
data["congestion_surcharge"] = data["congestion_surcharge"].fillna(0.0)
data["cbd_congestion_fee"] = data["cbd_congestion_fee"].fillna(0.0)

# Convert timestamps
data["lpep_pickup_datetime"] = pd.to_datetime(data["lpep_pickup_datetime"], errors="coerce")
data["lpep_dropoff_datetime"] = pd.to_datetime(data["lpep_dropoff_datetime"], errors="coerce")

# Derived features
data["trip_duration_min"] = (data["lpep_dropoff_datetime"] - data["lpep_pickup_datetime"]).dt.total_seconds() / 60
data["trip_speed_kmh"] = data["trip_distance"] / (data["trip_duration_min"] / 60)
data["fare_per_km"] = data["fare_amount"] / data["trip_distance"]

# Remove suspicious trips
suspicious = data[(data["trip_distance"] <= 0) | (data["fare_amount"] < 0)]
suspicious.to_csv("suspicious_green_records.csv", index=False)
data = data.drop(suspicious.index)

# Save cleaned dataset
data.to_csv("clean_green_tripdata_2025-01.csv", index=False)

print("Cleaned data saved as clean_green_tripdata_2025-01.csv")
print("Suspicious records logged (if any) in suspicious_green_records.csv")
