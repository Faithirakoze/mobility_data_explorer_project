// app.js
const apiBase = "http://localhost:5000/api";

const totalTripsEl = document.getElementById("total-trips");
const totalPassengersEl = document.getElementById("total-passengers");
const tripsTableBody = document.querySelector("#tripsTable tbody");
const tripsChartEl = document.getElementById("tripsChart").getContext("2d");

const vendorFilterEl = document.getElementById("vendorFilter");
const dayFilterEl = document.getElementById("dayFilter");
const monthFilterEl = document.getElementById("monthFilter");
const hourFilterEl = document.getElementById("hourFilter");
const applyFiltersBtn = document.getElementById("applyFilters");

let tripsChart;

// Fetch vendors for filter dropdown
async function fetchVendors() {
  const res = await fetch(`${apiBase}/vendors`);
  const vendors = await res.json();
  vendors.forEach(v => {
    const option = document.createElement("option");
    option.value = v.vendorId;
    option.textContent = v.name;
    vendorFilterEl.appendChild(option);
  });
}

// Fetch trips and apply filters
async function fetchTrips(filters = {}) {
  let url = `${apiBase}/trips`;
  const res = await fetch(url);
  let trips = await res.json();

  if (!Array.isArray(trips)) return;

  // Apply filters
  trips = trips.filter(t => {
    let match = true;

    if (filters.vendor && t.vendorId.toString() !== filters.vendor) match = false;

    if (filters.day) {
      const tripDate = new Date(t.pickupTime).toISOString().slice(0,10);
      if (tripDate !== filters.day) match = false;
    }

    if (filters.month) {
      const tripMonth = new Date(t.pickupTime).toISOString().slice(0,7);
      if (tripMonth !== filters.month) match = false;
    }

    if (filters.hour !== undefined && filters.hour !== "") {
      const tripHour = new Date(t.pickupTime).getHours();
      if (tripHour !== parseInt(filters.hour)) match = false;
    }

    return match;
  });

  // Stats
  const totalTrips = trips.length;
  const totalPassengers = trips.reduce((sum, t) => sum + (t.passengers || 0), 0);

  totalTripsEl.textContent = `Total Trips: ${totalTrips}`;
  totalPassengersEl.textContent = `Total Passengers: ${totalPassengers}`;

  // Populate table
  tripsTableBody.innerHTML = trips.map(t => `
    <tr>
      <td>${t.id}</td>
      <td>${t.vendorId}</td>
      <td>${t.distance || 0}</td>
      <td>${t.speed || 0}</td>
      <td>${t.passengers || 0}</td>
      <td>${new Date(t.pickupTime).toLocaleString()}</td>
    </tr>
  `).join("");

  // Chart: trips by hour
  const hours = Array(24).fill(0);
  trips.forEach(t => {
    const h = new Date(t.pickupTime).getHours();
    hours[h]++;
  });

  if (tripsChart) tripsChart.destroy();
  tripsChart = new Chart(tripsChartEl, {
    type: 'bar',
    data: {
      labels: Array.from({length: 24}, (_, i) => i + ":00"),
      datasets: [{
        label: 'Trips per Hour',
        data: hours,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Initialize
fetchVendors();
fetchTrips();

// Apply filters
applyFiltersBtn.addEventListener("click", () => {
  const filters = {
    vendor: vendorFilterEl.value,
    day: dayFilterEl.value,
    month: monthFilterEl.value,
    hour: hourFilterEl.value
  };
  fetchTrips(filters);
});

// Pagination variables
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageNumbersEl = document.getElementById('page-numbers');

let currentPage = 1;
const rowsPerPage = 10; // adjust as needed
let currentTrips = []; // will store filtered trips

function renderTablePage(page) {
  tripsTableBody.innerHTML = '';
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = currentTrips.slice(start, end);

  pageRows.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.id}</td>
      <td>${t.vendorId}</td>
      <td>${t.distance || 0}</td>
      <td>${t.speed || 0}</td>
      <td>${t.passengers || 0}</td>
      <td>${new Date(t.pickupTime).toLocaleString()}</td>
    `;
    tripsTableBody.appendChild(tr);
  });

  renderPageNumbers();
  prevBtn.disabled = page === 1;
  nextBtn.disabled = page === Math.ceil(currentTrips.length / rowsPerPage);
}

function renderPageNumbers() {
  pageNumbersEl.innerHTML = '';
  const totalPages = Math.ceil(currentTrips.length / rowsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const span = document.createElement('span');
    span.textContent = i;
    span.className = i === currentPage ? 'active' : '';
    span.addEventListener('click', () => {
      currentPage = i;
      renderTablePage(currentPage);
    });
    pageNumbersEl.appendChild(span);
  }
}

// Prev/Next buttons
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTablePage(currentPage);
  }
});

nextBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(currentTrips.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTablePage(currentPage);
  }
});

// Update fetchTrips to store filtered trips
async function fetchTrips(filters = {}) {
  let url = `${apiBase}/trips`;
  const res = await fetch(url);
  let trips = await res.json();

  if (!Array.isArray(trips)) return;

  // Apply filters
  trips = trips.filter(t => {
    let match = true;
    if (filters.vendor && t.vendorId.toString() !== filters.vendor) match = false;
    if (filters.day) {
      const tripDate = new Date(t.pickupTime).toISOString().slice(0,10);
      if (tripDate !== filters.day) match = false;
    }
    if (filters.month) {
      const tripMonth = new Date(t.pickupTime).toISOString().slice(0,7);
      if (tripMonth !== filters.month) match = false;
    }
    if (filters.hour !== undefined && filters.hour !== "") {
      const tripHour = new Date(t.pickupTime).getHours();
      if (tripHour !== parseInt(filters.hour)) match = false;
    }
    return match;
  });

  // Stats
  totalTripsEl.textContent = `Total Trips: ${trips.length}`;
  totalPassengersEl.textContent = `Total Passengers: ${trips.reduce((sum, t) => sum + (t.passengers || 0), 0)}`;

  // Store filtered trips for pagination
  currentTrips = trips;
  currentPage = 1;
  renderTablePage(currentPage);

  // Chart: trips by hour
  const hours = Array(24).fill(0);
  trips.forEach(t => hours[new Date(t.pickupTime).getHours()]++);
  if (tripsChart) tripsChart.destroy();
  tripsChart = new Chart(tripsChartEl, {
    type: 'bar',
    data: {
      labels: Array.from({length: 24}, (_, i) => i + ":00"),
      datasets: [{ label: 'Trips per Hour', data: hours, backgroundColor: 'rgba(75, 192, 192, 0.6)' }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

