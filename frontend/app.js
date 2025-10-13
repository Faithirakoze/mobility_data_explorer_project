
const BASE_URL = 'http://localhost:5000/api';

const vendorFilter = document.getElementById('vendor-filter');
const hourFilter = document.getElementById('hour-filter');
const sidebarVendorFilter = document.getElementById('sidebar-vendor-filter');
const sidebarHourFilter = document.getElementById('sidebar-hour-filter');
const applyFiltersBtn = document.getElementById('apply-filters');
const sidebarApplyBtn = document.getElementById('sidebar-apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');

const totalTripsEl = document.getElementById('total-trips');
const avgFareEl = document.getElementById('avg-fare');
const avgSpeedEl = document.getElementById('avg-speed');
const busiestHourEl = document.getElementById('busiest-hour');
const tripTableBody = document.getElementById('trip-table-body');
const insightList = document.getElementById('insight-list');

// FETCH & POPULATE FILTER OPTIONS
async function fetchVendors() {
  try {
    const response = await fetch(`${BASE_URL}/vendors`);
    if (!response.ok) throw new Error('Failed to fetch vendors');
    const vendors = await response.json();

    [vendorFilter, sidebarVendorFilter].forEach(select => {
      select.innerHTML = `<option value="">All Vendors</option>`;
      vendors.forEach(vendor => {
        const option = document.createElement('option');
        option.value = vendor.vendorId;
        option.textContent = vendor.name || `Vendor ${vendor.vendorId}`;
        select.appendChild(option);
      });
    });
  } catch (error) {
    console.error('Error loading vendors:', error);
  }
}

function populateHourFilters() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  [hourFilter, sidebarHourFilter].forEach(select => {
    select.innerHTML = `<option value="">All Hours</option>`;
    hours.forEach(hour => {
      const option = document.createElement('option');
      option.value = hour;
      option.textContent = `${hour}:00`;
      select.appendChild(option);
    });
  });
}

// FETCH TRIP DATA
async function fetchTrips(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${BASE_URL}/trips?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch trips');
    const trips = await response.json();

    updateMetrics(trips);
    renderTripTable(trips);
    generateInsights(trips);

  } catch (error) {
    console.error('Error fetching trips:', error);
  }
}

// RENDER FUNCTIONS
function updateMetrics(trips) {
  const totalTrips = trips.length;
  const avgFare = (trips.reduce((sum, t) => sum + (t.fare_amount || 0), 0) / totalTrips) || 0;
  const avgSpeed = (trips.reduce((sum, t) => sum + (t.avg_speed || 0), 0) / totalTrips) || 0;

  const hourCount = trips.reduce((acc, t) => {
    const hour = new Date(t.pickup_datetime).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  const busiestHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  totalTripsEl.textContent = `Total Trips: ${totalTrips}`;
  avgFareEl.textContent = `Average Fare: $${avgFare.toFixed(2)}`;
  avgSpeedEl.textContent = `Average Speed: ${avgSpeed.toFixed(1)} km/h`;
  busiestHourEl.textContent = `Busiest Hour: ${busiestHour}:00`;
}

function renderTripTable(trips) {
  tripTableBody.innerHTML = '';
  trips.forEach(trip => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trip.pickup_datetime}</td>
      <td>${trip.dropoff_datetime}</td>
      <td>${trip.vendor_id || 'N/A'}</td>
      <td>${trip.fare_amount?.toFixed(2) || 'N/A'}</td>
      <td>${trip.distance_km?.toFixed(2) || 'N/A'}</td>
      <td>${trip.avg_speed?.toFixed(2) || 'N/A'}</td>
    `;
    tripTableBody.appendChild(row);
  });
}

function generateInsights(trips) {
  insightList.innerHTML = '';

  if (trips.length === 0) {
    insightList.innerHTML = '<li>No data available for selected filters.</li>';
    return;
  }

  const totalFare = trips.reduce((sum, t) => sum + (t.fare_amount || 0), 0);
  const longestTrip = trips.reduce((a, b) => (a.distance_km > b.distance_km ? a : b));
  const fastestTrip = trips.reduce((a, b) => (a.avg_speed > b.avg_speed ? a : b));

  const insights = [
    `Total revenue: $${totalFare.toFixed(2)}`,
    `Longest trip distance: ${longestTrip.distance_km.toFixed(2)} km`,
    `Fastest trip speed: ${fastestTrip.avg_speed.toFixed(2)} km/h`,
  ];

  insights.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    insightList.appendChild(li);
  });
}

// FILTER HANDLERS
function gatherFilters() {
  return {
    vendor: vendorFilter.value || sidebarVendorFilter.value || '',
    hour: hourFilter.value || sidebarHourFilter.value || '',
    min_fare: document.getElementById('min-fare').value || document.getElementById('sidebar-min-fare').value || '',
    max_fare: document.getElementById('max-fare').value || document.getElementById('sidebar-max-fare').value || '',
    start_date: document.getElementById('start-date').value || '',
    end_date: document.getElementById('end-date').value || ''
  };
}

applyFiltersBtn.addEventListener('click', () => fetchTrips(gatherFilters()));
sidebarApplyBtn.addEventListener('click', () => fetchTrips(gatherFilters()));

resetFiltersBtn.addEventListener('click', () => {
  [vendorFilter, hourFilter, sidebarVendorFilter, sidebarHourFilter].forEach(s => s.value = '');
  document.querySelectorAll('input[type="number"], input[type="date"]').forEach(i => i.value = '');
  fetchTrips();
});

(async function init() {
  populateHourFilters();
  await fetchVendors();
  await fetchTrips();
})();
