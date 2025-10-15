const apiBase = "http://localhost:5000/api";

let hourlyChart, dailyChart;
let currentPage = 1;
const rowsPerPage = 20;
let currentTrips = [];

function showDashboard() {
  document.getElementById('dashboard-section').style.display = 'block';
  document.getElementById('trips-section').style.display = 'none';
}

function showTrips() {
  document.getElementById('dashboard-section').style.display = 'none';
  document.getElementById('trips-section').style.display = 'block';
  if (currentTrips.length === 0) {
    fetchTrips();
  }
}

async function fetchDashboardAnalytics() {
  try {
    const res = await fetch(`${apiBase}/trips/analyze`);
    const data = await res.json();
    
    const overall = data.overallStats;
    document.getElementById('total-trips').textContent = `Total Trips: ${overall.totalTrips.toLocaleString()}`;
    document.getElementById('avg-duration').textContent = `Avg Duration: ${Math.round(overall.avgDuration)} sec`;
    document.getElementById('avg-passengers').textContent = `Avg Passengers: ${overall.avgPassengers.toFixed(2)}`;
    
    renderHourlyChart(data.hourlyStats);
    renderDailyChart(data.dailyStats);
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    document.getElementById('total-trips').textContent = 'Error loading data';
  }
}

function renderHourlyChart(hourlyStats) {
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  
  const labels = hourlyStats.map(s => s.pickupHour);
  const tripCounts = hourlyStats.map(s => s.tripCount);
  const speeds = hourlyStats.map(s => s.avgSpeed);
  
  const peakHour = hourlyStats.reduce((max, s) => s.tripCount > max.tripCount ? s : max, hourlyStats[0]);
  const slowestHour = hourlyStats.reduce((min, s) => s.avgSpeed < min.avgSpeed ? s : min, hourlyStats[0]);
  
  document.getElementById('hourly-insight').innerHTML = `
    <strong>Peak Hours Insight:</strong> The busiest hour is <strong>${peakHour.pickupHour}</strong> with 
    <strong>${peakHour.tripCount.toLocaleString()}</strong> trips at an average speed of <strong>${peakHour.avgSpeed.toFixed(1)} km/h</strong>. 
    The slowest traffic occurs at <strong>${slowestHour.pickupHour}</strong> with speeds averaging 
    <strong>${slowestHour.avgSpeed.toFixed(1)} km/h</strong>, indicating heavy congestion during rush hours.
  `;
  
  if (hourlyChart) hourlyChart.destroy();
  hourlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Trip Count',
        data: tripCounts,
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        yAxisID: 'y'
      }, {
        label: 'Avg Speed (km/h)',
        data: speeds,
        type: 'line',
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        yAxisID: 'y1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Hourly Trip Distribution (All Data)',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Trip Count' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Speed (km/h)' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

function renderDailyChart(dailyStats) {
  const ctx = document.getElementById('dailyChart').getContext('2d');
  
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedStats = daysOrder.map(day => 
    dailyStats.find(s => s.pickupDayofweek === day) || { pickupDayofweek: day, tripCount: 0, avgDistance: 0, avgSpeed: 0 }
  );
  
  const labels = sortedStats.map(s => s.pickupDayofweek);
  const tripCounts = sortedStats.map(s => s.tripCount);
  const distances = sortedStats.map(s => s.avgDistance);
  
  const busiestDay = dailyStats.reduce((max, s) => s.tripCount > max.tripCount ? s : max, dailyStats[0]);
  const longestTripsDay = dailyStats.reduce((max, s) => s.avgDistance > max.avgDistance ? s : max, dailyStats[0]);
  const fastestDay = dailyStats.reduce((max, s) => s.avgSpeed > max.avgSpeed ? s : max, dailyStats[0]);
  
  document.getElementById('daily-insight').innerHTML = `
    <strong>Daily Patterns Insight:</strong> <strong>${busiestDay.pickupDayofweek}</strong> is the busiest day with 
    <strong>${busiestDay.tripCount.toLocaleString()}</strong> trips. <strong>${longestTripsDay.pickupDayofweek}</strong> 
    has the longest average trips (<strong>${longestTripsDay.avgDistance.toFixed(1)} km</strong>), suggesting more leisure 
    or airport travel. The fastest traffic is on <strong>${fastestDay.pickupDayofweek}</strong> at 
    <strong>${fastestDay.avgSpeed.toFixed(1)} km/h</strong> average speed.
  `;
  
  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Trip Count',
        data: tripCounts,
        borderColor: 'rgba(16, 185, 129, 0.8)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      }, {
        label: 'Avg Distance (km)',
        data: distances,
        borderColor: 'rgba(251, 146, 60, 0.8)',
        backgroundColor: 'rgba(251, 146, 60, 0.2)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Daily Trip Distribution (All Data)',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          position: 'left',
          title: { display: true, text: 'Trip Count' }
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          title: { display: true, text: 'Avg Distance (km)' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

async function fetchVendorsTable() {
  try {
    const res = await fetch(`${apiBase}/vendors`);
    const data = await res.json();
    const vendors = data.vendors || [];
    
    const tbody = document.querySelector('#vendorsTable tbody');
    tbody.innerHTML = '';
    
    const total = vendors.reduce((sum, v) => sum + v.tripCount, 0);
    
    vendors.forEach(v => {
      const marketShare = ((v.tripCount / total) * 100).toFixed(2);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.vendorId}</td>
        <td>${v.name}</td>
        <td>${v.tripCount.toLocaleString()}</td>
        <td>${marketShare}%</td>
      `;
      tbody.appendChild(tr);
    });
    
    const vendorFilter = document.getElementById('vendorFilter');
    vendors.forEach(v => {
      const option = document.createElement('option');
      option.value = v.vendorId;
      option.textContent = `${v.name} (${v.tripCount.toLocaleString()} trips)`;
      vendorFilter.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error fetching vendors:', error);
  }
}

async function fetchTrips(filters = {}) {
  const params = new URLSearchParams();
  params.append('limit', '1000');
  params.append('page', '1');
  
  if (filters.vendor) params.append('vendor_id', filters.vendor);
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.minDistance) params.append('min_distance', filters.minDistance);
  
  try {
    const res = await fetch(`${apiBase}/trips?${params.toString()}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    let trips = data.trips || [];

    if (!Array.isArray(trips)) {
      console.error('Trips is not an array:', trips);
      trips = [];
    }
    
    console.log(`Loaded ${trips.length} trips from API`);

    currentTrips = trips;
    currentPage = 1;
    
    if (trips.length === 0) {
      document.querySelector('#tripsTable tbody').innerHTML = 
        '<tr><td colspan="7" style="text-align:center; padding: 20px;">No trips found matching your filters</td></tr>';
      return;
    }
    
    renderTripsTable(currentPage);
    
  } catch (error) {
    console.error('Error fetching trips:', error);
    document.querySelector('#tripsTable tbody').innerHTML = 
      '<tr><td colspan="7" style="text-align:center; padding: 20px; color: red;">Error loading trips. Please check console.</td></tr>';
  }
}

function renderTripsTable(page) {
  const tbody = document.querySelector('#tripsTable tbody');
  tbody.innerHTML = '';
  
  if (!currentTrips || currentTrips.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">No trips available</td></tr>';
    document.getElementById('prev').disabled = true;
    document.getElementById('next').disabled = true;
    return;
  }
  
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = currentTrips.slice(start, end);

  pageRows.forEach(t => {
    const distance = t.analytics?.tripDistanceKm ? parseFloat(t.analytics.tripDistanceKm).toFixed(2) : '0.00';
    const speed = t.analytics?.tripSpeedKmh ? parseFloat(t.analytics.tripSpeedKmh).toFixed(2) : '0.00';
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.id}</td>
      <td>${t.vendor?.name || 'Vendor ' + t.vendorId}</td>
      <td>${distance}</td>
      <td>${speed}</td>
      <td>${t.tripDuration}</td>
      <td>${t.passengerCount}</td>
      <td>${new Date(t.pickupDatetime).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });

  renderPageNumbers();
  document.getElementById('prev').disabled = page === 1;
  document.getElementById('next').disabled = page === Math.ceil(currentTrips.length / rowsPerPage);
}

function renderPageNumbers() {
  const pageNumbersEl = document.getElementById('page-numbers');
  pageNumbersEl.innerHTML = '';
  const totalPages = Math.ceil(currentTrips.length / rowsPerPage);
  
  if (totalPages <= 1) return;
  
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  if (currentPage <= 3) {
    endPage = Math.min(5, totalPages);
  }
  
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }
  
  if (startPage > 1) {
    addPageNumber(1, pageNumbersEl);
    
    if (startPage > 2) {
      addDots(pageNumbersEl);
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    addPageNumber(i, pageNumbersEl);
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) addDots(pageNumbersEl);
    addPageNumber(totalPages, pageNumbersEl);
  }
  
  const info = document.createElement('span');
  info.textContent = `Page ${currentPage} of ${totalPages}`;
  info.style.marginLeft = '10px';
  info.style.cursor = 'default';
  info.style.border = '2px solid #e5e7eb';
  info.style.backgroundColor = '#f9fafb';
  info.style.color = '#6b7280';
  info.style.fontWeight = '600';
  info.style.padding = '8px 16px';
  info.style.minWidth = 'auto';
  pageNumbersEl.appendChild(info);
}

function addPageNumber(num, container) {
  const span = document.createElement('span');
  span.textContent = num;
  span.className = num === currentPage ? 'active' : '';
  span.addEventListener('click', () => {
    currentPage = num;
    renderTripsTable(currentPage);
  });
  container.appendChild(span);
}

function addDots(container) {
  const dots = document.createElement('span');
  dots.textContent = '⋯';
  dots.style.cursor = 'default';
  dots.style.border = '2px solid transparent';
  dots.style.backgroundColor = 'transparent';
  dots.style.color = '#9ca3af';
  dots.style.fontSize = '1.2rem';
  dots.style.fontWeight = '700';
  dots.style.padding = '8px 12px';
  container.appendChild(dots);
}

async function fetchRankedTrips() {
  const sortBy = document.getElementById('sortByFilter').value;
  const order = document.getElementById('orderFilter').value;
  const limit = document.getElementById('limitFilter').value;
  
  try {
    const res = await fetch(`${apiBase}/trips/ranked?sortBy=${sortBy}&order=${order}&limit=${limit}`);
    const data = await res.json();
    
    const statsDiv = document.getElementById('algorithm-stats');
    statsDiv.innerHTML = `
      <strong>Algorithm:</strong> ${data.algorithm} | 
      <strong>Sort By:</strong> ${data.sortBy} | 
      <strong>Order:</strong> ${data.order} | 
      <strong>Total Processed:</strong> ${data.stats.totalTrips} trips<br>
      <strong>Comparisons:</strong> ${data.stats.comparisons.toLocaleString()} | 
      <strong>Swaps:</strong> ${data.stats.swaps.toLocaleString()} | 
      <strong>Complexity:</strong> ${data.stats.complexity}
    `;
    
    const tbody = document.querySelector('#rankedTripsTable tbody');
    tbody.innerHTML = '';
    
    data.trips.forEach((t, index) => {
      const distance = t.analytics?.tripDistanceKm ? parseFloat(t.analytics.tripDistanceKm).toFixed(2) : '0.00';
      const speed = t.analytics?.tripSpeedKmh ? parseFloat(t.analytics.tripSpeedKmh).toFixed(2) : '0.00';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${index + 1}</strong></td>
        <td>${t.id}</td>
        <td>${t.vendor?.name || 'Vendor ' + t.vendorId}</td>
        <td>${distance}</td>
        <td>${speed}</td>
        <td>${t.tripDuration}</td>
      `;
      tbody.appendChild(tr);
    });
    
  } catch (error) {
    console.error('Error fetching ranked trips:', error);
    document.getElementById('algorithm-stats').innerHTML = '<span style="color: red;">Error loading ranked trips</span>';
  }
}

document.getElementById('dashboard-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active'));
  e.target.classList.add('active');
  showDashboard();
});

document.getElementById('trips-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active'));
  e.target.classList.add('active');
  showTrips();
});

document.getElementById('applyFilters').addEventListener('click', () => {
  const filters = {
    vendor: document.getElementById('vendorFilter').value,
    startDate: document.getElementById('startDateFilter').value,
    endDate: document.getElementById('endDateFilter').value,
    minDistance: document.getElementById('minDistanceFilter').value
  };
  console.log('Applying filters:', filters);
  fetchTrips(filters);
});

document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('vendorFilter').value = '';
  document.getElementById('startDateFilter').value = '';
  document.getElementById('endDateFilter').value = '';
  document.getElementById('minDistanceFilter').value = '';
  fetchTrips();
});

document.getElementById('applyRankingBtn').addEventListener('click', fetchRankedTrips);

document.getElementById('prev').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTripsTable(currentPage);
  }
});

document.getElementById('next').addEventListener('click', () => {
  const totalPages = Math.ceil(currentTrips.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTripsTable(currentPage);
  }
});

const menuToggle = document.getElementById('menuToggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const menu = document.getElementById('sidebarMenu');
    menu.classList.toggle('active');
  });
}

document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      const menu = document.getElementById('sidebarMenu');
      if (menu) {
        menu.classList.remove('active');
      }
    }
  });
});

console.log('Initializing dashboard...');
fetchDashboardAnalytics();
fetchVendorsTable();


