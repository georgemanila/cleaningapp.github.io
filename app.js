document.addEventListener('DOMContentLoaded', function() {
    setCurrentDateMax();
    prepareTableHeader();
    updateEntriesAndTotals();
});

const entries = []; // Store entries
const locations = new Set(); // For datalist suggestions
const orderedLocations = []; // Maintain order of locations as they're added

function isValidTimeFormat(timeString) {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
}

function addEntry() {
    const date = document.getElementById('date').value;
    const location = document.getElementById('location').value;
    let timeInput = document.getElementById('hours').value; // This is in HH:MM format or possibly a single digit

    // Check if the input is a single digit (or two digits) and convert it to HH:MM format
    if (/^\d{1,2}$/.test(timeInput)) {
        timeInput = `${timeInput.padStart(2, '0')}:00`; // Ensure it's two digits followed by :00
    }

    // Validate the time input in HH:MM format
    if (!date || !location || !isValidTimeFormat(timeInput)) {
        alert('Please fill all fields correctly. Time must be in HH:MM format.');
        return;
    }

    entries.push({ date, location, hours: timeInput });

    if (!locations.has(location)) {
        locations.add(location);
        if (!orderedLocations.includes(location)) {
            orderedLocations.push(location);
        }
    }

    updateEntriesAndTotals();
}


function updateLocationDatalist() {
    const locationList = document.getElementById('locationList');
    locationList.innerHTML = '';
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        locationList.appendChild(option);
    });
}

function populateEntriesTable() {
    const tableBody = document.getElementById('entriesTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    entries.forEach(({ date, location, hours }) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = date;
        row.insertCell().textContent = location;
        row.insertCell().textContent = hours;
    });
}

function setCurrentDateMax() {
    const today = new Date();
    document.getElementById('date').setAttribute('max', today.toISOString().split('T')[0]);
}

function sumTimes(times) {
    let totalMinutes = times.reduce((total, time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return total + hours * 60 + minutes;
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}`;
}

function calculateAndDisplayTotals() {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const tbody = document.querySelector('#totalsTable tbody');
    tbody.innerHTML = '';

    orderedLocations.forEach(location => {
        const row = tbody.insertRow();
        row.insertCell().textContent = location;
        let monthlyTimes = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTimes = entries.filter(entry => entry.date === dateStr && entry.location === location).map(entry => entry.hours);
            const dayTotalTime = sumTimes(dayTimes);
            monthlyTimes.push(dayTotalTime);
            row.insertCell().textContent = dayTotalTime || '0:00';
        }
        row.insertCell().textContent = sumTimes(monthlyTimes);
    });
}

function prepareTableHeader() {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const thead = document.querySelector('#totalsTable thead');
    thead.innerHTML = ''; // Clear the header content

    const headerRow = thead.insertRow();

    // Ensure the "Location" header cell gets the "green-header" class
    const locationHeader = headerRow.insertCell();
    locationHeader.textContent = 'Location';
    locationHeader.className = 'green-header'; // Apply the class for green background

    // Apply "green-header" class to day headers
    for (let day = 1; day <= daysInMonth; day++) {
        const dayHeader = headerRow.insertCell();
        dayHeader.textContent = day;
        dayHeader.className = 'green-header'; // This ensures the day headers are also green
    }

    // Ensure the "Total Hours" header also gets the "green-header" class
    const totalHoursHeader = headerRow.insertCell();
    totalHoursHeader.textContent = 'Total Hours';
    totalHoursHeader.className = 'green-header'; // Apply the class for green background
}


function updateEntriesAndTotals() {
    updateLocationDatalist();
    populateEntriesTable();
    calculateAndDisplayTotals();
}
