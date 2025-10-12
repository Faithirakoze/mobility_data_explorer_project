# Mobility Data Explorer - Backend API

Node.js backend API for exploring NYC Taxi Trip data with MySQL database and Prisma ORM.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Data Loading**: Python (for bulk imports)

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── database.js        # Prisma client config
│   ├── controllers/
│   │   └── tripController.js  # Business logic for trips
│   ├── routes/
│   │   └── tripRoutes.js      # API route definitions
│   ├── scripts/
│   │   └── loadData.py        # Bulk data loader (Python)
│   └── server.js              # Express server entry point
├── package.json
└── .env                       # Environment variables
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
DATABASE_URL="mysql://username:password@localhost:3306/mobility_data"
PORT=5000
```

### 3. Setup Database

```bash
# Create database schema
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 4. Load Data

**Prerequisites:**
```bash
pip install pandas mysql-connector-python python-dotenv
```

**Run bulk data loader:**
```bash
cd backend
python3 src/scripts/loadData.py
```

**Performance:**
- Speed: ~150K-250K records/minute
- Time: 5-10 minutes for 1.5M records
- Batch size: 5,000 records
- Safe to interrupt and resume

### 5. Start Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server runs on: `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Get All Trips (Paginated)
```http
GET /api/trips
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Records per page (default: 50)
- `vendor_id` (number) - Filter by vendor ID
- `start_date` (string) - Filter by start date (ISO: 2016-01-01)
- `end_date` (string) - Filter by end date (ISO: 2016-12-31)
- `min_distance` (number) - Minimum trip distance in km

**Response:**
```json
{
  "trips": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1458644,
    "pages": 29173
  }
}
```

**Examples:**
```bash
# Get first page
curl http://localhost:5000/api/trips?page=1&limit=10

# Filter by vendor
curl http://localhost:5000/api/trips?vendor_id=1

# Filter by date range
curl "http://localhost:5000/api/trips?start_date=2016-06-01&end_date=2016-06-30"

# Filter by distance
curl http://localhost:5000/api/trips?min_distance=10
```

---

#### 2. Get Single Trip
```http
GET /api/trips/:id
```

**Response:**
```json
{
  "id": "id2875421",
  "vendorId": 2,
  "pickupDatetime": "2016-03-14T17:24:55.000Z",
  "dropoffDatetime": "2016-03-14T17:32:30.000Z",
  "passengerCount": 1,
  "tripDuration": 455,
  "vendor": { "vendorId": 2, "name": "Vendor 2" },
  "analytics": {
    "pickupHour": "05 PM",
    "pickupDayofweek": "Monday",
    "tripDistanceKm": 1.5,
    "tripSpeedKmh": 11.87
  }
}
```

**Example:**
```bash
curl http://localhost:5000/api/trips/id2875421
```

---

#### 3. Analyze Trips (Statistics)
```http
GET /api/trips/analyze
```

**Response:**
```json
{
  "hourlyStats": [
    {
      "pickupHour": "05 PM",
      "tripCount": 36841,
      "avgSpeed": 12.49,
      "avgDistance": 3.31
    }
  ],
  "dailyStats": [
    {
      "pickupDayofweek": "Friday",
      "tripCount": 108047,
      "avgSpeed": 13.72,
      "avgDistance": 3.41
    }
  ],
  "overallStats": {
    "totalTrips": 1458644,
    "avgDuration": 956.8,
    "avgPassengers": 1.66
  }
}
```

**Insights:**
- **Hourly patterns**: Peak demand and traffic congestion by hour
- **Daily patterns**: Busiest days and average trip characteristics
- **Overall metrics**: Total trips, average duration, passenger counts

**Example:**
```bash
curl http://localhost:5000/api/trips/analyze
```

---

#### 4. Delete Trip
```http
DELETE /api/trips/:id
```

**Response:**
```json
{
  "message": "Trip deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/trips/id2875421
```

---

#### 5. Get All Vendors
```http
GET /api/vendors
```

**Response:**
```json
{
  "vendors": [
    {
      "vendorId": 1,
      "name": "Vendor 1",
      "tripCount": 520631
    },
    {
      "vendorId": 2,
      "name": "Vendor 2",
      "tripCount": 938013
    }
  ]
}
```

**Use Case:** Populate vendor dropdown filter on frontend

**Example:**
```bash
curl http://localhost:5000/api/vendors
```

---

#### 6. Get Single Vendor
```http
GET /api/vendors/:id
```

**Response:**
```json
{
  "vendorId": 1,
  "name": "Vendor 1",
  "tripCount": 520631
}
```

**Example:**
```bash
curl http://localhost:5000/api/vendors/1
```

---

#### 7. Rank Trips (Custom Algorithm)
```http
GET /api/trips/ranked
```

**Query Parameters:**
- `sortBy` - Criteria: 'distance' | 'speed' | 'duration' | 'fare' (default: distance)
- `order` - Order: 'asc' | 'desc' (default: desc)
- `limit` - Number of results (default: 100)

**Response:**
```json
{
  "trips": [...],
  "algorithm": "QuickSort",
  "sortBy": "distance",
  "order": "desc",
  "stats": {
    "totalTrips": 1000,
    "comparisons": 8234,
    "swaps": 2104,
    "complexity": "O(n log n) average, O(n²) worst"
  }
}
```

**Use Case:** Identify longest/shortest trips, fastest/slowest trips using custom QuickSort algorithm

**Examples:**
```bash
# Longest trips
curl "http://localhost:5000/api/trips/ranked?sortBy=distance&order=desc&limit=10"

# Fastest trips
curl "http://localhost:5000/api/trips/ranked?sortBy=speed&order=desc&limit=10"

# Shortest duration
curl "http://localhost:5000/api/trips/ranked?sortBy=duration&order=asc&limit=10"
```

**Algorithm Details:** See [ALGORITHM_ANALYSIS.md](src/algorithms/ALGORITHM_ANALYSIS.md) for full complexity analysis and implementation details.

## Database Schema

### Tables

**vendors**
- `vendor_id` (INT, PK) - Vendor identifier
- `name` (VARCHAR) - Vendor name

**trips**
- `id` (VARCHAR, PK) - Trip identifier
- `vendor_id` (INT, FK) - Reference to vendor
- `pickup_datetime` (DATETIME) - Pickup timestamp
- `dropoff_datetime` (DATETIME) - Dropoff timestamp
- `passenger_count` (INT) - Number of passengers
- `pickup_longitude` (DECIMAL) - Pickup location longitude
- `pickup_latitude` (DECIMAL) - Pickup location latitude
- `dropoff_longitude` (DECIMAL) - Dropoff location longitude
- `dropoff_latitude` (DECIMAL) - Dropoff location latitude
- `store_and_fwd_flag` (CHAR) - Store and forward flag
- `trip_duration` (INT) - Trip duration in seconds

**trip_analytics**
- `id` (INT, PK) - Auto-increment ID
- `trip_id` (VARCHAR, FK) - Reference to trip
- `pickup_hour` (VARCHAR) - Hour of pickup (e.g., "05 PM")
- `pickup_dayofweek` (VARCHAR) - Day of week (e.g., "Monday")
- `trip_distance_km` (DECIMAL) - Distance in kilometers
- `trip_duration_hours` (DECIMAL) - Duration in hours
- `trip_speed_kmh` (DECIMAL) - Speed in km/h

### Indexes
- `vendor_id` on trips
- `pickup_datetime` on trips
- `pickup_hour` on trip_analytics
- `pickup_dayofweek` on trip_analytics

## Performance Optimizations

1. **Raw SQL queries** for analytics endpoints (2-5x faster than ORM)
2. **Database indexes** on frequently queried columns
3. **Pagination** for large result sets
4. **Batch processing** for data imports
5. **Connection pooling** with Prisma

## Data Loading Script

The Python bulk loader (`src/scripts/loadData.py`) provides:

- **Fast bulk insertion** using MySQL's `executemany`
- **Resume capability** - safe to stop and restart (uses `INSERT IGNORE`)
- **Progress tracking** - real-time metrics
- **Memory efficient** - 5K record batches

**Data Flow:**
1. Load vendors (deduplicated)
2. Load trips with full details
3. Load trip analytics metrics
4. Commit in batches for safety

## Troubleshooting

### Connection Issues
```bash
# Test MySQL connection
mysql -u username -p -h localhost mobility_data

# Verify DATABASE_URL in .env
cat .env
```

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database
npx prisma db push --force-reset
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Sync database schema

### Adding New Endpoints

1. Add controller function in `src/controllers/`
2. Add route in `src/routes/`
3. Test endpoint with curl or Postman


