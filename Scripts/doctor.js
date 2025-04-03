// API base URL - change this to your json-server URL
const BIN_ID = '67e689e68a456b79667e534c';
const API_KEY = '$2a$10$vvG4aV/MVldkC/BJks0nXufnzwRVo6546Suwy/jrN3FXuLfLwsWNq';
const API_BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// DOM Elements
const universalSearchButton = document.getElementById('universal-search-button');
const universalSearchModal = document.getElementById('universal-search-modal');
const modalCloseButton = document.getElementById('modal-close-button');
const universalSearchForm = document.getElementById('universal-search-form');
const donorResultsModal = document.getElementById('donor-results-modal');
const resultsCloseButton = document.getElementById('results-close-button');
const searchById = document.getElementById('search-by-id');
const searchByBlood = document.getElementById('search-by-blood');
const idSearchContainer = document.getElementById('id-search-container');
const bloodSearchContainer = document.getElementById('blood-search-container');
const loginForm = document.getElementById('login-form');
const loginButton = document.getElementById('login-button');
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const logoutButton = document.getElementById('logout-button');
const searchTab = document.getElementById('search-tab');
const requestTab = document.getElementById('request-tab');
const searchContent = document.getElementById('search-content');
const requestContent = document.getElementById('request-content');
const searchInput = document.getElementById('search-input');
const bloodTypeFilter = document.getElementById('blood-type-filter');
const locationFilter = document.getElementById('location-filter');
const donorsTableBody = document.getElementById('donors-table-body');
const requestForm = document.getElementById('request-form');

// Loading indicators
const tableLoadingIndicator = document.createElement('tr');
tableLoadingIndicator.innerHTML = `
  <td colspan="7" class="text-center py-10">
    <div class="loading-spinner"></div>
    <p class="mt-4 text-secondary">Loading donor data...</p>
  </td>
`;

// Error indicators
const tableErrorIndicator = document.createElement('tr');
tableErrorIndicator.innerHTML = `
  <td colspan="7" class="text-center text-secondary py-10">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <p>Error loading donor data. Please try again later.</p>
  </td>
`;

// State
let donors = [];
let filteredDonors = [];

// Fetch all donors from the API
async function fetchDonors() {
  if (!donorsTableBody) return;
  
  try {
    donorsTableBody.innerHTML = '';
    donorsTableBody.appendChild(tableLoadingIndicator);
    
    const response = await fetch(`${API_BASE_URL}/latest`, {
      headers: {
        'X-Master-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const { record } = await response.json();
    donors = record.donors || [];
    filteredDonors = donors;
    renderDonors(donors);
  } catch (error) {
    console.error('Error fetching donors:', error);
    donorsTableBody.innerHTML = '';
    donorsTableBody.appendChild(tableErrorIndicator);
  }
}

// Fetch a single donor by ID
// Fetch a single donor by ID
async function fetchDonorById(id) {
  try {
    // 1. First fetch the entire bin
    const response = await fetch(`${API_BASE_URL}/latest`, {
      headers: {
        'X-Master-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // 2. Get the complete data
    const { record } = await response.json();
    
    // 3. Find the donor by ID in the donors array
    const foundDonor = record.donors.find(donor => donor.id == id); // Use == for loose comparison
    
    if (!foundDonor) {
      throw new Error(`Donor with ID ${id} not found`);
    }
    
    return foundDonor;
  } catch (error) {
    console.error(`Error fetching donor with ID ${id}:`, error);
    return null;
  }
}
// Fetch donors by blood type
async function fetchDonorsByBloodType(bloodType) {
  try {
    const response = await fetch(`${API_BASE_URL}/latest?bloodType=${bloodType}`, {
      headers: {
        'X-Master-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching donors with blood type ${bloodType}:`, error);
    return [];
  }
}

// Create a new blood request
async function createBloodRequest(requestData) {
  try {
      const response = await fetch(`${API_BASE_URL}/latest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify({
        ...requestData,
        status: 'active',
        createdAt: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating blood request:', error);
    return null;
  }
}

// Render donors table
function renderDonors(donors) {
  if (!donorsTableBody) return;
  
  donorsTableBody.innerHTML = '';
  
  if (donors.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="7" class="text-center text-secondary py-10">
        No donors found matching your criteria.
      </td>
    `;
    donorsTableBody.appendChild(emptyRow);
    return;
  }
  
  donors.forEach(donor => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="font-medium">${donor.name}</div>
      </td>
      <td>
        <span class="blood-type-badge">
          ${donor.bloodType}
        </span>
      </td>
      <td>${donor.age}</td>
      <td>${donor.gender}</td>
      <td>${donor.location}</td>
      <td>${donor.lastDonation}</td>
      <td>
        <div class="contact-buttons">
          <button class="contact-button" title="${donor.contact}" data-donor-id="${donor.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </button>
          <button class="contact-button" title="${donor.email}" data-donor-id="${donor.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </button>
        </div>
      </td>
    `;
    donorsTableBody.appendChild(row);
  });
  
  // Add event listeners to contact buttons
  document.querySelectorAll('.contact-button').forEach(button => {
    button.addEventListener('click', async () => {
      const donorId = button.getAttribute('data-donor-id');
      if (donorId) {
        const donor = await fetchDonorById(donorId);
        if (donor) {
          showDonorDetails(donor);
        }
      }
    });
  });
}

// Filter donors
function filterDonors() {
  if (!searchInput || !bloodTypeFilter || !locationFilter) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  const bloodType = bloodTypeFilter.value;
  const location = locationFilter.value.toLowerCase();
  
  filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm);
    const matchesBloodType = bloodType ? donor.bloodType === bloodType : true;
    const matchesLocation = location ? donor.location.toLowerCase().includes(location) : true;
    
    return matchesSearch && matchesBloodType && matchesLocation;
  });
  
  renderDonors(filteredDonors);
}

// Show donor details in the modal
function showDonorDetails(donor) {
  // Populate donor information
  document.getElementById('donor-blood-type').textContent = donor.bloodType;
  document.getElementById('donor-name').textContent = donor.name;
  document.getElementById('donor-id-display').textContent = `ID: DON-${donor.id}`;
  document.getElementById('donor-age').textContent = donor.age;
  document.getElementById('donor-gender').textContent = donor.gender;
  document.getElementById('donor-weight').textContent = donor.weight;
  document.getElementById('donor-last-donation').textContent = donor.lastDonation;
  document.getElementById('donor-bp').textContent = donor.bloodPressure;
  document.getElementById('donor-hemoglobin').textContent = donor.hemoglobin;
  document.getElementById('donor-hiv').textContent = donor.hivStatus;
  document.getElementById('donor-hepatitis').textContent = donor.hepatitis;
  document.getElementById('donor-medical-history').textContent = donor.medicalHistory;
  document.getElementById('donor-phone').textContent = donor.contact;
  document.getElementById('donor-email').textContent = donor.email;
  document.getElementById('donor-address').textContent = donor.address;
  
  // Set current date and medical professional info
  document.getElementById('access-date').textContent = new Date().toLocaleString();
  document.getElementById('medical-professional').textContent = 'Authorized Medical Professional';
  
  // Show the results modal
  donorResultsModal.classList.remove('hidden');
}

// Event Listeners

// Search type toggle
if (searchById && searchByBlood) {
  searchById.addEventListener('change', () => {
    idSearchContainer.classList.remove('hidden');
    bloodSearchContainer.classList.add('hidden');
    document.getElementById('donor-id').setAttribute('required', '');
    document.getElementById('blood-type-search').removeAttribute('required');
  });
  
  searchByBlood.addEventListener('change', () => {
    idSearchContainer.classList.add('hidden');
    bloodSearchContainer.classList.remove('hidden');
    document.getElementById('donor-id').removeAttribute('required');
    document.getElementById('blood-type-search').setAttribute('required', '');
  });
}

// Open universal search modal
if (universalSearchButton && universalSearchModal) {
  universalSearchButton.addEventListener('click', () => {
    universalSearchModal.classList.remove('hidden');
  });
}

// Close universal search modal
if (modalCloseButton && universalSearchModal) {
  modalCloseButton.addEventListener('click', () => {
    universalSearchModal.classList.add('hidden');
  });
}

// Close donor results modal
if (resultsCloseButton && donorResultsModal) {
  resultsCloseButton.addEventListener('click', () => {
    donorResultsModal.classList.add('hidden');
  });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    if (universalSearchModal) universalSearchModal.classList.add('hidden');
    if (donorResultsModal) donorResultsModal.classList.add('hidden');
  }
});

// Handle universal search form submission
if (universalSearchForm) {
  universalSearchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const medicalId = document.getElementById('medical-id').value;
    const hospitalName = document.getElementById('hospital-name').value;
    const emergencyLevel = document.getElementById('emergency-level').value;
    const searchType = document.querySelector('input[name="search-type"]:checked').value;
    const donorId = document.getElementById('donor-id').value;
    const bloodType = document.getElementById('blood-type-search').value;
    const reason = document.getElementById('reason').value;
    
    // Log the search request
    console.log('Search Request:', { 
      medicalId, 
      hospitalName, 
      emergencyLevel,
      searchType,
      donorId: searchType === 'id' ? donorId : null,
      bloodType: searchType === 'blood' ? bloodType : null,
      reason
    });
    
    // Close search modal
    universalSearchModal.classList.add('hidden');
    
    try {
      let donor = null;
      
      if (searchType === 'id') {
        // Fetch donor by ID
        donor = await fetchDonorById(donorId);
      } else if (searchType === 'blood') {
        // Fetch donors by blood type
        const donorsByBloodType = await fetchDonorsByBloodType(bloodType);
        if (donorsByBloodType.length > 0) {
          donor = donorsByBloodType[0];
        }
      }
      
      if (donor) {
        showDonorDetails(donor);
      } else {
        alert('No donor found with the specified criteria.');
      }
    } catch (error) {
      console.error('Error searching for donor:', error);
      alert('An error occurred while searching for donor information. Please try again later.');
    }
  });
}

// Login functionality
if (loginForm && loginButton) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginButton.textContent = 'Logging in...';
    loginButton.disabled = true;
    
    // Simulate authentication (any credentials will work)
    setTimeout(() => {
      loginSection.classList.add('hidden');
      dashboardSection.classList.remove('hidden');
      loginButton.textContent = 'Login';
      loginButton.disabled = false;
      
      // Fetch donors when dashboard is shown
      fetchDonors();
    }, 1500);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
  });
}

// Tab functionality
if (searchTab && requestTab) {
  searchTab.addEventListener('click', () => {
    searchTab.classList.add('tab-active');
    requestTab.classList.remove('tab-active');
    searchContent.classList.remove('hidden');
    requestContent.classList.add('hidden');
  });

  requestTab.addEventListener('click', () => {
    requestTab.classList.add('tab-active');
    searchTab.classList.remove('tab-active');
    requestContent.classList.remove('hidden');
    searchContent.classList.add('hidden');
  });
}

// Add event listeners for filtering
if (searchInput) searchInput.addEventListener('input', filterDonors);
if (bloodTypeFilter) bloodTypeFilter.addEventListener('change', filterDonors);
if (locationFilter) locationFilter.addEventListener('input', filterDonors);

// Request form submission
if (requestForm) {
  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const hospital = document.getElementById('hospital').value;
    const doctorName = document.getElementById('doctor-name').value;
    const bloodType = document.getElementById('blood-type-needed').value;
    const units = document.getElementById('units').value;
    const urgency = document.getElementById('urgency').value;
    const requiredDate = document.getElementById('required-date').value;
    const notes = document.getElementById('notes').value;
    
    const requestData = { 
      hospital, 
      doctorName, 
      bloodType, 
      units: parseInt(units), 
      urgency, 
      requiredDate, 
      notes 
    };
    
    try {
      const submitButton = requestForm.querySelector('button[type="submit"]');
      submitButton.textContent = 'Submitting...';
      submitButton.disabled = true;
      
      const result = await createBloodRequest(requestData);
      
      if (result) {
        alert('Blood request submitted successfully! We will notify matching donors in your area.');
        requestForm.reset();
      } else {
        alert('Failed to submit blood request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting blood request:', error);
      alert('An error occurred while submitting your request. Please try again later.');
    } finally {
      const submitButton = requestForm.querySelector('button[type="submit"]');
      submitButton.textContent = 'Submit Blood Request';
      submitButton.disabled = false;
    }
  });
}

// Add loading spinner CSS
const style = document.createElement('style');
style.textContent = `
  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--primary);
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
