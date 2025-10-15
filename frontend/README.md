# Mobility Data Explorer - Frontend Dashboard

Interactive web dashboard for visualizing and exploring NYC Taxi Trip data using vanilla JavaScript, HTML, and CSS.

## Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Responsive design with Grid & Flexbox
- **Vanilla JavaScript (ES6+)** - No frameworks
- **Chart.js** - Data visualization library
- **Fetch API** - RESTful API communication

## Project Structure

```
frontend/
├── index.html          # Main HTML structure
├── styles.css          # Responsive styling
├── app.js              # Application logic and API integration
└── README.md           # This file
```

## Features

### 1. Dashboard Page
- **Overview Statistics**: Total trips, average duration, average passengers
- **Hourly Distribution Chart**: Dual-axis visualization showing trip counts and average speeds by hour
- **Daily Distribution Chart**: Multi-dataset line chart showing trip patterns across weekdays
- **Insights Generation**: Automatic analysis highlighting peak hours, congestion patterns, and busiest days
- **Vendors Table**: Complete vendor overview with market share calculations

### 2. Trips Page
- **Custom Algorithm Ranking**: QuickSort-based trip ranking with performance metrics
- **Advanced Filtering**: Multi-criteria filtering (vendor, date range, minimum distance)
- **Trip Records Table**: Paginated display of trip data with 20 rows per page
- **Smart Pagination**: Ellipsis-based page navigation with visual indicators

### 3. Responsive Design
- **Desktop**: Full sidebar navigation with expanded charts
- **Tablet**: Horizontal menu with optimized layouts
- **Mobile**: Hamburger menu with touch-friendly controls

## Architecture & Design Decisions

### Data Flow Architecture

```
┌─────────────────┐
│   Backend API   │
│  (Node.js)      │
└────────┬────────┘
         │
         │ REST API Calls
         │
         ▼
┌─────────────────┐
│  app.js         │
│  (Controller)   │
└────────┬────────┘
         │
         │ DOM Manipulation
         │
         ▼
┌─────────────────┐
│  index.html     │
│  (View Layer)   │
└─────────────────┘
```

### API Integration Strategy

**Dashboard Analytics** (`/api/trips/analyze`)
- Fetches aggregated statistics for all 1.4M+ trips
- Renders three visualization types: bar, line, and table
- Generates dynamic insights based on peak patterns

**Trips Data** (`/api/trips`)
- Loads 1,000 trips for interactive exploration
- **Why 1,000?**: Balance between coverage and browser performance
  - Loading all 1.4M trips would freeze the browser
  - 1,000 trips provide sufficient data for filtering and analysis
  - Lightweight enough for smooth DOM rendering and pagination
  - Uses only ~2-3MB of memory vs 200MB+ for full dataset
- Client-side pagination (20 rows/page = 50 pages)
- Efficient memory usage with array slicing

**Vendor Data** (`/api/vendors`)
- Populates filter dropdowns dynamically
- Calculates market share percentages

**Ranked Trips** (`/api/trips/ranked`)
- Demonstrates custom QuickSort algorithm
- Displays algorithm performance metrics

### Performance Optimizations

1. **Lazy Loading**: Trips page data loads only when navigated to
2. **Chart Destruction**: Destroys existing chart instances before re-rendering
3. **Pagination**: Limits DOM elements to 20 rows at a time
4. **Event Delegation**: Minimizes event listeners on dynamic elements
5. **Smart Page Numbers**: Shows max 5-7 page buttons with ellipsis

### Responsive Design Approach

**Mobile-First Strategy**
- Base styles for mobile devices
- Progressive enhancement for larger screens
- CSS Grid for flexible layouts

**Breakpoints**
- `480px`: Small mobile (stacked layout)
- `768px`: Tablet (horizontal menu)
- `1024px`: Desktop (optimized charts)
- `1200px`: Large desktop (multi-column grids)

## Key Implementation Details

### Chart Rendering Logic

**Dual-Axis Charts**
- Primary Y-axis: Trip counts
- Secondary Y-axis: Speed/Distance metrics
- Allows correlation analysis between volume and traffic conditions

**Dynamic Insights**
- Uses `Array.reduce()` to find peak/minimum values
- Generates human-readable interpretations
- Updates inline with chart rendering

### Pagination Algorithm

```javascript
Smart Page Display:
- Shows current page ± 2 pages
- Always shows first and last page
- Ellipsis (...) for gaps
- Example: 1 ... 8 9 [10] 11 12 ... 50
```

**Benefits**
- Prevents pagination overflow on small screens
- Maintains context with first/last page links
- Responsive to total page count

### State Management

**Global State Variables**
```javascript
currentPage      // Active pagination page
currentTrips     // Filtered trip dataset
hourlyChart      // Chart.js instance (hourly)
dailyChart       // Chart.js instance (daily)
```

**Why No Framework?**
- Lightweight (no bundle overhead)
- Direct DOM control for learning
- Faster initial load
- No build step required

## Setup & Usage

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Backend API running on `http://localhost:5000`

### Running the Frontend

```bash
cd frontend
python3 -m http.server 3000
```

Open browser to: `http://localhost:3000`


## User Interface Guide

### Dashboard Navigation

1. **Overview Cards**: Displays key metrics at a glance
2. **Charts**: Interactive visualizations with hover tooltips
3. **Insights**: Auto-generated findings below each chart
4. **Vendors Table**: Sortable vendor performance data

### Trips Page Workflow

1. **Ranking Section** (Top)
   - Select sort criteria (distance, speed, duration)
   - Choose order (ascending/descending)
   - Set result limit (1-100)
   - View algorithm performance stats

2. **Filtering Section** (Middle)
   - Select vendor from dropdown
   - Choose date range
   - Set minimum distance threshold
   - Apply or clear filters

3. **Results Table** (Bottom)
   - Browse paginated results
   - Click page numbers to navigate
   - View trip details per row

## Data Visualization Choices

### Hourly Chart (Bar + Line)
**Rationale**: Bar chart shows discrete hourly counts, line overlay shows continuous speed trend. This reveals congestion patterns where high trip counts correlate with low speeds.

### Daily Chart (Multi-Line)
**Rationale**: Line chart emphasizes weekly cyclical patterns. Two datasets (count + distance) reveal behavioral differences between weekdays and weekends.

### Vendors Table (Not Chart)
**Rationale**: Only 2 vendors make pie/bar charts redundant. Table with market share percentage provides clearer comparison.

## Insights Generation Logic

### Peak Hours Insight
1. Find hour with maximum trip count
2. Find hour with minimum average speed
3. Generate comparative statement about congestion

### Daily Patterns Insight
1. Identify busiest day by trip volume
2. Find day with longest average trips
3. Find day with fastest traffic
4. Infer travel patterns (commute vs. leisure)

### Vendor Market Share
1. Sum total trips across vendors
2. Calculate percentage for each vendor
3. Highlight dominant vendor

## Styling Philosophy

### Color Palette
- **Primary**: `#4f46e5` (Indigo) - Actions, active states
- **Secondary**: `#1e293b` (Slate) - Navigation, headers
- **Success**: `#10b981` (Green) - Positive metrics
- **Warning**: `#f59e0b` (Amber) - Alerts
- **Danger**: `#ef4444` (Red) - Errors

### Design Principles
1. **Consistency**: Uniform spacing (8px grid system)
2. **Hierarchy**: Clear visual weight (font sizes, colors)
3. **Accessibility**: High contrast ratios, touch-friendly targets
4. **Feedback**: Hover states, transitions, loading indicators

## Browser Compatibility

Works on all modern browsers (Chrome, Firefox, Safari, Edge).  
Requires: ES6, Fetch API, CSS Grid/Flexbox, Canvas API.

## Troubleshooting

### Charts Not Rendering
**Issue**: Blank canvas elements
**Solution**: 
- Check browser console for errors
- Verify Chart.js CDN is loaded
- Ensure backend `/api/trips/analyze` returns data

### Trips Table Empty
**Issue**: "No trips found" message
**Solution**:
- Verify backend is running on port 5000
- Check `/api/trips` endpoint returns array
- Open Network tab to inspect API response

### Pagination Not Working
**Issue**: Page numbers don't respond to clicks
**Solution**:
- Ensure `currentTrips` array has data
- Check console for JavaScript errors
- Verify `renderPageNumbers()` is called after data load

### Mobile Menu Not Toggling
**Issue**: Hamburger menu doesn't open
**Solution**:
- Check `menuToggle` element exists in DOM
- Verify screen width is below 768px
- Inspect CSS `.sidebar ul.active` rule



