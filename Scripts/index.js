// API base URL - change this to your json-server URL
const BIN_ID = '67e689e68a456b79667e534c';
const API_KEY = '$2a$10$vvG4aV/MVldkC/BJks0nXufnzwRVo6546Suwy/jrN3FXuLfLwsWNq';
const API_BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Form validation and submission
const form = document.getElementById('registration-form');
const submitButton = document.getElementById('submit-button');
const donorForm = document.getElementById('donor-form');
const successMessage = document.getElementById('success-message');
const registerAnother = document.getElementById('register-another');
const fileUpload = document.getElementById('file-upload');
const fileName = document.getElementById('file-name');

// File upload handling
if (fileUpload && fileName) {
  fileUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      fileName.textContent = `File selected: ${e.target.files[0].name}`;
      fileName.classList.remove('hidden');
    } else {
      fileName.classList.add('hidden');
    }
  });
}

// Create a new donor
async function createDonor(donorData) {
  try {
    const response = await fetch(`${API_BASE_URL}/donors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(donorData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating donor:', error);
    throw error;
  }
}

// Form submission
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Basic validation
    let isValid = true;
    
    // Validate full name
    const fullName = document.getElementById('fullName');
    const fullNameError = document.getElementById('fullName-error');
    if (fullName.value.length < 2) {
      fullNameError.textContent = 'Full name must be at least 2 characters.';
      fullNameError.classList.remove('hidden');
      isValid = false;
    } else {
      fullNameError.classList.add('hidden');
    }
    
    // Validate email
    const email = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      emailError.textContent = 'Please enter a valid email address.';
      emailError.classList.remove('hidden');
      isValid = false;
    } else {
      emailError.classList.add('hidden');
    }
    
    // Validate phone
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    if (phone.value.length < 10) {
      phoneError.textContent = 'Phone number must be at least 10 digits.';
      phoneError.classList.remove('hidden');
      isValid = false;
    } else {
      phoneError.classList.add('hidden');
    }
    
    // Validate age
    const age = document.getElementById('age');
    const ageError = document.getElementById('age-error');
    if (parseInt(age.value) < 18) {
      ageError.textContent = 'You must be at least 18 years old to donate blood.';
      ageError.classList.remove('hidden');
      isValid = false;
    } else {
      ageError.classList.add('hidden');
    }
    
    // Validate consent
    const consent = document.getElementById('consent');
    const consentError = document.getElementById('consent-error');
    if (!consent.checked) {
      consentError.textContent = 'You must agree to the terms and conditions.';
      consentError.classList.remove('hidden');
      isValid = false;
    } else {
      consentError.classList.add('hidden');
    }
    
    if (isValid) {
      // Prepare form data
      const donorData = {
        name: fullName.value,
        email: email.value,
        contact: phone.value,
        age: parseInt(age.value),
        gender: document.getElementById('gender').value,
        bloodType: document.getElementById('bloodType').value,
        address: document.getElementById('address').value,
        medicalHistory: document.getElementById('medicalHistory').value || 'None provided',
        lastDonation: document.getElementById('lastDonation').value || 'Never donated',
        weight: '70 kg', // Default value
        bloodPressure: '120/80', // Default value
        hemoglobin: '14.0 g/dL', // Default value
        hivStatus: 'Negative', // Default value
        hepatitis: 'Negative', // Default value
        location: document.getElementById('address').value.split(',').pop().trim() || 'Unknown'
      };
      
      try {
        // Update UI to show loading state
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Send data to API
        const result = await createDonor(donorData);
        
        if (result) {
          // Show success message
          donorForm.classList.add('hidden');
          successMessage.classList.remove('hidden');
          
          // Reset form
          form.reset();
          fileName.classList.add('hidden');
        } else {
          alert('Failed to register donor. Please try again.');
        }
      } catch (error) {
        console.error('Error registering donor:', error);
        alert('An error occurred while registering. Please try again later.');
      } finally {
        submitButton.textContent = 'Register as Donor';
        submitButton.disabled = false;
      }
    }
  });
}

// Register another donor
if (registerAnother) {
  registerAnother.addEventListener('click', () => {
    successMessage.classList.add('hidden');
    donorForm.classList.remove('hidden');
  });
}
