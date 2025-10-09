import pandas
import math

# Load data
data = pandas.read_csv("data/raw/train.csv")

def calculate_distance(row):
    """
    Calculate distance between pickup and dropoff points
    Returns distance in kilometers
    """
    # Get coordinates
    lat1 = row['pickup_latitude']
    lon1 = row['pickup_longitude']
    lat2 = row['dropoff_latitude']
    lon2 = row['dropoff_longitude']

    # Convert to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    # Radius of earth in kilometers
    r = 6371
    distance = c * r

    return distance

# Ensure datetime columns are in datetime format
data["pickup_datetime"] = pandas.to_datetime(data["pickup_datetime"], errors="coerce")
data["dropoff_datetime"] = pandas.to_datetime(data["dropoff_datetime"], errors="coerce")

# Check for duplicates
data = data.drop_duplicates()


#Derived features
data["pickup_hour"] = data["pickup_datetime"].dt.strftime("%I %p")
data["pickup_dayofweek"] = data["pickup_datetime"].dt.day_name()

# Calculate trip distance
data["trip_distance_km"] = data.apply(calculate_distance, axis=1).round(2)

# Calculate trip speed
# trip_duration is in seconds, so we convert to hours
data["trip_duration_hours"] = data["trip_duration"] / 3600
data["trip_speed_kmh"] = (data["trip_distance_km"] / data["trip_duration_hours"]).round(2)

print(data[['id', 'trip_distance_km', 'trip_duration_hours', 'trip_speed_kmh']].head())

# Save processed data
data.to_csv("data/processed/trip_processed_data.csv", index=False)
