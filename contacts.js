// Global variables
let currentPage = 1;
const rowsPerPage = 10;
let allEmployees = [];
// Auto-refresh settings
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function startAutoRefresh() {
    await fetchEmployeeData(); // Initial load
    setInterval(fetchEmployeeData, REFRESH_INTERVAL); // Periodic refresh
}

// DOM Elements
let searchInput;
let branchFilter;
let tableBody;
let paginationDiv;

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkFyVkJaebVJWqM-jn-MTWXSlqZXcoCEn55yWe7z9ROzxjWTYzz2dZlq74DBshUJ7hmNYsheJnupPm/pub?output=csv';

// Main Functions
async function fetchEmployeeData() {
    try {
        showLoadingState();
        const response = await fetch(SHEET_URL);
        const csvData = await response.text();
        
        const results = Papa.parse(csvData, { 
            header: true,
            skipEmptyLines: true
        });

        allEmployees = results.data.map(row => ({
            branch: row['Branch'] || '',
            fullName: row['Employee Name'] || '',
            employeeNumber: row['Employee nr'] || '',
            employeeId: row['Employee ID'] || '',
            officePhone: row['Office Tel nr'] || '',
            speedDial: row['Speed dial nr'] || '',
            cellPhone: row['Cell nr'] || '',
            email: row['Email address'] || '',
        }));

        filterAndDisplayEmployees();
    } catch (error) {
        console.error('Error loading employee data:', error);
        showErrorState();
    }
}

function showLoadingState() {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading employee data...</td></tr>';
}

function showErrorState() {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Error loading employee data. Please try again later.</td></tr>';
}

function displayEmployees(employeesToDisplay, page) {
    tableBody.innerHTML = '';
    
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedEmployees = employeesToDisplay.slice(start, end);
    
    if (paginatedEmployees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No employees found matching your criteria.</td></tr>';
        return;
    }
    
    paginatedEmployees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                ${employee.photo ? `<img src="${employee.photo}" alt="${employee.fullName}" class="employee-photo">` : ''}
                ${employee.fullName}
            </td>
            <td>${employee.employeeId || employee.employeeNumber}</td>
            <td>${employee.branch}</td>
            <td>${formatPhoneNumber(employee.cellPhone || employee.officePhone)}</td>
            <td>${employee.email}</td>
            <td class="employee-actions">
                <a href="mailto:${employee.email}" title="Email"><i class="fas fa-envelope"></i></a>
                <a href="tel:${cleanPhoneNumber(employee.cellPhone || employee.officePhone)}" title="Call">
                    <i class="fas fa-phone"></i>
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    updatePagination(employeesToDisplay.length);
}

function formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('27')) {
        return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
    }
    return phone;
}

function cleanPhoneNumber(phone) {
    return phone ? phone.replace(/\D/g, '') : '';
}

function updatePagination(totalEmployees) {
    const pageCount = Math.ceil(totalEmployees / rowsPerPage);
    paginationDiv.innerHTML = '';
    
    if (pageCount <= 1) return;
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            filterAndDisplayEmployees();
        }
    });
    paginationDiv.appendChild(prevButton);
    
    // Page buttons
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.textContent = '1';
        firstButton.addEventListener('click', () => {
            currentPage = 1;
            filterAndDisplayEmployees();
        });
        paginationDiv.appendChild(firstButton);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationDiv.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = currentPage === i ? 'active' : '';
        pageButton.addEventListener('click', () => {
            currentPage = i;
            filterAndDisplayEmployees();
        });
        paginationDiv.appendChild(pageButton);
    }
    
    if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationDiv.appendChild(ellipsis);
        }
        
        const lastButton = document.createElement('button');
        lastButton.textContent = pageCount;
        lastButton.addEventListener('click', () => {
            currentPage = pageCount;
            filterAndDisplayEmployees();
        });
        paginationDiv.appendChild(lastButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === pageCount;
    nextButton.addEventListener('click', () => {
        if (currentPage < pageCount) {
            currentPage++;
            filterAndDisplayEmployees();
        }
    });
    paginationDiv.appendChild(nextButton);
}

function filterAndDisplayEmployees() {
    const searchTerm = searchInput.value.toLowerCase();
    const branchFilterValue = branchFilter.value;
    
    let filteredEmployees = allEmployees;
    
    // Apply branch filter
    if (branchFilterValue) {
        filteredEmployees = filteredEmployees.filter(employee => 
            employee.branch === branchFilterValue
        );
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredEmployees = filteredEmployees.filter(employee => 
            employee.fullName.toLowerCase().includes(searchTerm) || 
            (employee.employeeId && employee.employeeId.toString().toLowerCase().includes(searchTerm)) ||
            (employee.email && employee.email.toLowerCase().includes(searchTerm)) ||
            (employee.branch && employee.branch.toLowerCase().includes(searchTerm))
        );
    }
    
    currentPage = 1;
    displayEmployees(filteredEmployees, currentPage);
}

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

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    searchInput = document.getElementById('employee-search');
    branchFilter = document.getElementById('branch-filter');
    tableBody = document.getElementById('employee-table-body');
    paginationDiv = document.getElementById('pagination');
    
    // Verify elements exist
    if (!searchInput || !branchFilter || !tableBody || !paginationDiv) {
        console.error('Critical elements not found!');
        return;
    }
    
    // Set up event listeners
    searchInput.addEventListener('input', debounce(filterAndDisplayEmployees, 300));
    branchFilter.addEventListener('change', filterAndDisplayEmployees);
    
    // Replace this line: fetchEmployeeData();
    startAutoRefresh(); // This will handle both initial load and auto-refresh
});