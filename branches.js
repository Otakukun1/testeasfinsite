// Configuration
const BRANCHES_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQL3Vcqei-cgn3SgPHS6FyckzYJibSzjpclMBHeWZuH46AwOVDFxoDgHI7nT8R4qeZmHxCxGa8bvVEc/pub?output=csv';
const BRANCHES_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

// DOM Elements
const branchesContainer = document.getElementById('branches-container');
const branchSearch = document.getElementById('branch-search');
const provinceFilter = document.getElementById('province-filter');
let allBranches = [];

// Main function to fetch and display branches
async function fetchAndDisplayBranches() {
    try {
        showLoadingState();
        
        const response = await fetch(BRANCHES_SHEET_URL);
        const csvData = await response.text();
        
        const results = Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true
        });

        allBranches = results.data.map(branch => ({
            companyName: branch['Company Name'] || '',
            tradingName: branch['Trading Name'] || '',
            vatNumber: branch['VAT nr'] || '',
            regionalManager: branch['Regional Manager Name'] || '',
            regionalManagerEmail: branch['Regional Managers Email'] || '',
            regionalManagerCell: branch['Cellular nr of Area Manager'] || '',
            branchManager: branch['Branch Manager\'s Name'] || '',
            branchManagerCell: branch['Branch Managers\' Cell Nr'] || '',
            branchManagerEmail: branch['Branch Managers\' Email'] || '',
            branchTel: branch['Branch Tel number'] || '',
            branchEmail: branch['Branch\'s Email Address'] || '',
            bankName: branch['Bank'] || '',
            branchName: branch['Branch Name'] || '',
            addressCombined: branch['Address Combined'] || '',
            building: branch['Unit / Building Name'] || '',
            street: branch['Street Name'] || '',
            suburb: branch['Suburb'] || '',
            town: branch['Town'] || '',
            province: branch['Province'] || '',
            postalCode: branch['Postal Code'] || ''
        }));

        displayBranches(allBranches);
        populateProvinceFilter();
    } catch (error) {
        console.error('Error loading branch data:', error);
        showErrorState();
    }
}

// Display branches in the UI
function displayBranches(branches) {
    branchesContainer.innerHTML = '';
    
    if (branches.length === 0) {
        branchesContainer.innerHTML = '<div class="no-results">No branches found matching your criteria.</div>';
        return;
    }
    
    branches.forEach(branch => {
        const branchCard = document.createElement('div');
        branchCard.className = 'branch-card';
        
        branchCard.innerHTML = `
            <h3>${branch.tradingName || branch.branchName}</h3>
            <div class="branch-info">
                <p><strong>Branch Manager:</strong> ${branch.branchManager}</p>
                <p><strong>Contact:</strong> ${formatPhoneNumber(branch.branchTel)}</p>
                <p><strong>Cell:</strong> ${formatPhoneNumber(branch.branchManagerCell)}</p>
                <p><strong>Address:</strong> ${branch.addressCombined || `${branch.building} ${branch.street}, ${branch.suburb}, ${branch.town}`}</p>
                <p><strong>Province:</strong> ${branch.province}</p>
                <p><strong>Postal Code:</strong> ${branch.postalCode}</p>
            </div>
            <div class="contact-links">
                ${branch.branchTel ? `<a href="tel:${cleanPhoneNumber(branch.branchTel)}" title="Call Branch"><i class="fas fa-phone"></i> Call</a>` : ''}
                ${branch.branchEmail ? `<a href="mailto:${branch.branchEmail}" title="Email Branch"><i class="fas fa-envelope"></i> Email</a>` : ''}
                ${branch.branchManagerCell ? `<a href="tel:${cleanPhoneNumber(branch.branchManagerCell)}" title="Call Manager"><i class="fas fa-mobile-alt"></i> Manager</a>` : ''}
            </div>
        `;
        
        branchesContainer.appendChild(branchCard);
    });
}

// Helper functions
function formatPhoneNumber(phone) {
    if (!phone) return 'Not available';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('27')) {
        return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
    }
    return phone;
}

function cleanPhoneNumber(phone) {
    return phone ? phone.replace(/\D/g, '') : '';
}

function showLoadingState() {
    branchesContainer.innerHTML = '<div class="loading">Loading branch information...</div>';
}

function showErrorState() {
    branchesContainer.innerHTML = '<div class="error">Error loading branch data. Please try again later.</div>';
}

function populateProvinceFilter() {
    const provinces = [...new Set(allBranches.map(branch => branch.province).filter(Boolean))];
    provinces.sort();
    
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        provinceFilter.appendChild(option);
    });
}

// Filter functions
function filterBranches() {
    const searchTerm = branchSearch.value.toLowerCase();
    const province = provinceFilter.value;
    
    let filtered = allBranches;
    
    if (province) {
        filtered = filtered.filter(branch => branch.province === province);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(branch => 
            (branch.tradingName && branch.tradingName.toLowerCase().includes(searchTerm)) ||
            (branch.branchName && branch.branchName.toLowerCase().includes(searchTerm)) ||
            (branch.town && branch.town.toLowerCase().includes(searchTerm)) ||
            (branch.branchManager && branch.branchManager.toLowerCase().includes(searchTerm))
        );
    }
    
    displayBranches(filtered);
}

// Event listeners
branchSearch.addEventListener('input', debounce(filterBranches, 300));
provinceFilter.addEventListener('change', filterBranches);

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Initialize and set up auto-refresh
document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayBranches();
    setInterval(fetchAndDisplayBranches, BRANCHES_REFRESH_INTERVAL);
});