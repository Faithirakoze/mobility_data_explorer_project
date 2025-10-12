import pandas as pd
import mysql.connector
from mysql.connector import Error
import time
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

def parse_database_url(url):
    parsed = urlparse(url)
    return {
        'host': parsed.hostname,
        'database': parsed.path[1:],
        'user': parsed.username,
        'password': parsed.password,
        'port': parsed.port or 3306
    }

DB_CONFIG = parse_database_url(os.getenv('DATABASE_URL'))
CSV_PATH = 'data/processed/trip_processed_data.csv'
BATCH_SIZE = 5000

def load_data():
    start = time.time()
    
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM trips")
    existing = cursor.fetchone()[0]
    
    df = pd.read_csv(CSV_PATH)
    print(f"Loading {len(df):,} records...")
    print(f"Already loaded: {existing:,} records")
    
    if existing > 0:
        cursor.execute("SELECT id FROM trips")
        existing_ids = set(row[0] for row in cursor.fetchall())
        df = df[~df['id'].isin(existing_ids)]
        print(f"Remaining: {len(df):,} records")
    
    try:
        vendors = df[['vendor_id']].drop_duplicates()
        vendor_values = [(int(row['vendor_id']), f"Vendor {row['vendor_id']}") 
                        for _, row in vendors.iterrows()]
        
        cursor.executemany(
            'INSERT IGNORE INTO vendors (vendor_id, name) VALUES (%s, %s)',
            vendor_values
        )
        print(f"✓ Vendors: {len(vendors):,}")
        
        df['pickup_datetime'] = pd.to_datetime(df['pickup_datetime'])
        df['dropoff_datetime'] = pd.to_datetime(df['dropoff_datetime'])
        
        total = 0
        for i in range(0, len(df), BATCH_SIZE):
            batch = df.iloc[i:i+BATCH_SIZE]
            
            trip_values = [
                (row['id'], int(row['vendor_id']), row['pickup_datetime'], 
                 row['dropoff_datetime'], int(row['passenger_count']),
                 float(row['pickup_longitude']), float(row['pickup_latitude']),
                 float(row['dropoff_longitude']), float(row['dropoff_latitude']),
                 row['store_and_fwd_flag'], int(row['trip_duration']))
                for _, row in batch.iterrows()
            ]
            
            cursor.executemany(
                '''INSERT IGNORE INTO trips (id, vendor_id, pickup_datetime, dropoff_datetime,
                   passenger_count, pickup_longitude, pickup_latitude, dropoff_longitude,
                   dropoff_latitude, store_and_fwd_flag, trip_duration) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                trip_values
            )
            
            analytics_values = [
                (row['id'], 
                 row['pickup_hour'] if pd.notna(row['pickup_hour']) else None,
                 row['pickup_dayofweek'] if pd.notna(row['pickup_dayofweek']) else None,
                 float(row['trip_distance_km']) if pd.notna(row['trip_distance_km']) else None,
                 float(row['trip_duration_hours']) if pd.notna(row['trip_duration_hours']) else None,
                 float(row['trip_speed_kmh']) if pd.notna(row['trip_speed_kmh']) else None)
                for _, row in batch.iterrows()
            ]
            
            cursor.executemany(
                '''INSERT IGNORE INTO trip_analytics (trip_id, pickup_hour, pickup_dayofweek,
                   trip_distance_km, trip_duration_hours, trip_speed_kmh)
                   VALUES (%s, %s, %s, %s, %s, %s)''',
                analytics_values
            )
            
            conn.commit()
            total += len(batch)
            print(f"Progress: {total:,}/{len(df):,} ({total/len(df)*100:.1f}%)")
        
        print(f"✓ Trips: {len(df):,}")
        print(f"✓ Analytics: {len(df):,}")
        
    except Error as e:
        conn.rollback()
        print(f"✗ Error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()
    
    elapsed = (time.time() - start) / 60
    print(f"\n✓ Done in {elapsed:.2f} min ({int(len(df)/elapsed):,} rows/min)")

if __name__ == "__main__":
    load_data()