# Urban Mobility Data Explorer

Full-stack application for analyzing 1.4M+ NYC Taxi Trip records.

## How It Works

### 1. Data Processing (`data/main.py`)
- Loads raw NYC taxi trip dataset (1.4M+ records)
- Cleans data (removes duplicates, handles missing values)
- Calculates derived features using Haversine formula:
  - Trip distance (km)
  - Trip speed (km/h)
  - Trip duration (hours)
  - Pickup hour and day of week

### 2. Data Loading (`backend/src/scripts/loadData.py`)
- Bulk inserts processed data into MySQL database
- 3 tables: vendors, trips, trip_analytics
- Performance: 150K-250K records/minute

### 3. Backend API (`backend/`)
- Node.js + Express + Prisma ORM
- 7 REST endpoints for data access
- Custom QuickSort algorithm for trip ranking
- Serves aggregated analytics from full dataset

### 4. Frontend Dashboard (`frontend/`)
- Vanilla JavaScript (no frameworks)
- Interactive charts (hourly/daily patterns)
- Advanced filtering (vendor, date, distance)
- Responsive design (mobile/tablet/desktop)

## Tech Stack

**Backend**: Node.js, Express, MySQL, Prisma  
**Frontend**: HTML, CSS, JavaScript, Chart.js  
**Data Processing**: Python (pandas, mysql-connector)

## Quick Start

```bash
git clone https://github.com/Faithirakoze/mobility_data_explorer_project.git
cd mobility_data_explorer_project

# Setup and start backend
cd backend
npm install
npx prisma db push && npx prisma generate
npm start

# Start frontend (new terminal)
cd frontend
python3 -m http.server 3000
```

**Access**: Frontend at http://localhost:3000 | API at http://localhost:5000/api

## Detailed Documentation

- **[Backend API Documentation](backend/README.md)** - API endpoints, setup, database schema
- **[Frontend Documentation](frontend/README.md)** - Architecture, UI guide, performance
- **[Algorithm Analysis](backend/src/algorithms/ALGORITHM_ANALYSIS.md)** - QuickSort complexity analysis
