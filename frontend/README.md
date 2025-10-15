# Mobility Data Explorer - Frontend Dashboard

Interactive web dashboard for visualizing and exploring NYC Taxi Trip data.

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Chart.js for data visualization
- Fetch API for backend communication

## Project Structure

```
frontend/
├── index.html          # Main HTML structure
├── styles.css          # Responsive styling
└── app.js              # Application logic and API integration
```

## Features

### Dashboard Page
- Overview statistics (total trips, avg duration, avg passengers)
- Hourly distribution chart (trip counts and speeds)
- Daily distribution chart (trip patterns across weekdays)
- Automated insights (peak hours, congestion, busiest days)
- Vendors table with market share

### Trips Page
- Custom QuickSort algorithm ranking with performance metrics
- Advanced filtering (vendor, date range, minimum distance)
- Paginated trip records table (20 rows per page)
- Smart pagination with ellipsis navigation

### Responsive Design
- Desktop: Full sidebar navigation
- Tablet: Horizontal menu
- Mobile: Hamburger menu with touch controls

## API Integration

**Dashboard Analytics** (`/api/trips/analyze`)
- Aggregated statistics from all 1.4M+ trips
- Three visualization types: bar, line, table
- Dynamic insights based on peak patterns

**Trips Data** (`/api/trips`)
- Loads 1,000 trips for interactive exploration
- Balance between coverage and browser performance
- Client-side pagination (50 pages)

**Vendor Data** (`/api/vendors`)
- Populates filter dropdowns
- Calculates market share percentages

**Ranked Trips** (`/api/trips/ranked`)
- Demonstrates custom QuickSort algorithm
- Shows algorithm performance metrics

## Setup & Usage

### Prerequisites
- Modern web browser
- Backend API running on `http://localhost:5000`

### Running
Open `index.html` in your browser or use any static file server on port 3000.

## Data Visualization

### Hourly Chart (Bar + Line)
Bar chart shows hourly trip counts, line overlay shows speed trends. Reveals congestion patterns where high trip counts correlate with low speeds.

### Daily Chart (Multi-Line)
Emphasizes weekly cyclical patterns. Two datasets (count + distance) reveal behavioral differences between weekdays and weekends.

### Vendors Table
Only 2 vendors in dataset, so table with market share percentage provides clearer comparison than charts.

## Performance

- Lazy loading: Trips page data loads only when navigated
- Chart destruction: Destroys existing instances before re-rendering
- Pagination: Limits DOM to 20 rows at a time
- Smart page numbers: Shows max 5-7 page buttons with ellipsis

## Responsive Breakpoints

- 480px: Small mobile
- 768px: Tablet
- 1024px: Desktop
- 1200px: Large desktop
