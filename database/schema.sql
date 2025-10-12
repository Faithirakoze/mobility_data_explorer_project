CREATE DATABASE IF NOT EXISTS mobility_data;
USE mobility_data;

CREATE TABLE vendors (
    vendor_id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE trips (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id INT NOT NULL,
    pickup_datetime DATETIME NOT NULL,
    dropoff_datetime DATETIME NOT NULL,
    passenger_count INT NOT NULL,
    pickup_longitude DECIMAL(10, 8) NOT NULL,
    pickup_latitude DECIMAL(11, 8) NOT NULL,
    dropoff_longitude DECIMAL(10, 8) NOT NULL,
    dropoff_latitude DECIMAL(11, 8) NOT NULL,
    store_and_fwd_flag CHAR(1),
    trip_duration INT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_pickup_datetime (pickup_datetime)
);

CREATE TABLE trip_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id VARCHAR(50) UNIQUE NOT NULL,
    pickup_hour VARCHAR(10),
    pickup_dayofweek VARCHAR(10),
    trip_distance_km DECIMAL(10, 2),
    trip_duration_hours DECIMAL(10, 4),
    trip_speed_kmh DECIMAL(10, 2),
    FOREIGN KEY (trip_id) REFERENCES trips(id),
    INDEX idx_pickup_hour (pickup_hour),
    INDEX idx_pickup_dayofweek (pickup_dayofweek)
);



