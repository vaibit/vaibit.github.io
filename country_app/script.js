let countries = [];
let map, markerGroup;

// Initialize the map
function initMap() {
    console.log("Map initialized");
    map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    fetchCountryBorders();
}

// Reset the map and dropdowns
function resetMap() {
    if (markerGroup) {
        markerGroup.clearLayers();
    }
    map.setView([20, 0], 2);
    document.getElementById("region").value = "";
    document.getElementById("subregion").value = "";
    document.getElementById("country").value = "";
    updateSubregionOptions();
    updateCountryOptions();
}

// Populate initial data for dropdowns
async function populateInitialData() {
    const API_URL = "https://restcountries.com/v3.1/all?fields=name,flags,latlng,region,subregion,languages,currencies,population,timezones";
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        countries = await response.json();
        
        // Populate Region dropdown with unique values
        const regions = Array.from(new Set(countries.map(country => country.region).filter(Boolean))).sort();
        populateDropdown('region', regions);

        // Populate Country dropdown initially with all country names
        const countryNames = Array.from(new Set(countries.map(country => country.name.common).filter(Boolean))).sort();
        populateDropdown('country', countryNames);
    } catch (error) {
        console.error("Failed to fetch country data:", error);
    }
}

function populateDropdown(id, values) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = `<option value="">Select ${id.charAt(0).toUpperCase() + id.slice(1)}</option>`;
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
    });
}

function updateSubregionOptions() {
    const selectedRegion = document.getElementById('region').value;

    let filteredCountries = countries;

    // If Region is selected, filter countries by Region
    if (selectedRegion) {
        filteredCountries = filteredCountries.filter(country => country.region === selectedRegion);
    } else {
        // If no Region is selected, clear Subregion dropdown
        populateDropdown('subregion', []);
    }

    // Get unique Subregions within the selected Region
    const subregions = Array.from(new Set(filteredCountries.map(country => country.subregion).filter(Boolean))).sort();

    // Populate Subregion dropdown
    populateDropdown('subregion', subregions);

    // Update Country dropdown based on the new selections
    updateCountryOptions();
}

function updateCountryOptions() {
    const selectedRegion = document.getElementById('region').value;
    const selectedSubregion = document.getElementById('subregion').value;

    let filteredCountries = countries;

    // Filter countries based on selected Region
    if (selectedRegion) {
        filteredCountries = filteredCountries.filter(country => country.region === selectedRegion);
    }

    // Further filter by selected Subregion
    if (selectedSubregion) {
        filteredCountries = filteredCountries.filter(country => country.subregion === selectedSubregion);
    }

    // Get unique country names from the filtered list
    const countryNames = Array.from(new Set(filteredCountries.map(country => country.name.common).filter(Boolean))).sort();

    // Populate the Country dropdown
    populateDropdown('country', countryNames);

    // Reset the Country selection
    document.getElementById('country').value = "";
}

function filterCountries() {
const region = document.getElementById("region").value;
const subregion = document.getElementById("subregion").value;
const countryName = document.getElementById("country").value;

let filteredCountries = countries;

if (region) {
filteredCountries = filteredCountries.filter(country => country.region === region);
}

if (subregion) {
filteredCountries = filteredCountries.filter(country => country.subregion === subregion);
}

if (countryName) {
filteredCountries = filteredCountries.filter(country => country.name.common === countryName);
}

addCountryMarkers(filteredCountries);


// Center the map if a single country is selected
if (filteredCountries.length === 1) {
const country = filteredCountries[0];
const [lat, lng] = country.latlng || [0, 0];
map.flyTo([lat, lng], 5, { duration: 1.5 }); // 1.5 seconds animation
}
}


function addCountryMarkers(countries) {
    if (markerGroup) {
        markerGroup.clearLayers();
    }
    markerGroup = L.layerGroup();

    countries.forEach(country => {
        const [lat, lng] = country.latlng || [0, 0];

        // Use custom timezone or fallback to default timezone
        const timezone = customTimezones[country.name.common] || (country.timezones ? country.timezones[0] : "UTC");
        const localTime = getLocalTime(timezone);
        const marker = L.marker([lat, lng]).addTo(markerGroup);
        marker.bindPopup(`
            <div style="text-align: center;">
                <h3>${country.name.common}</h3>
                <img src="https://flagcdn.com/${country.cca2.toLowerCase()}.svg" alt="${country.name.common} flag" style="width: 50px; height: auto; margin: 10px 0;">
                <p><strong>Population:</strong> ${country.population ? country.population.toLocaleString() : "N/A"}</p>
                <p><strong>Timezone:</strong> ${country.timezones ? country.timezones[0] : "N/A"}</p>
                <p><strong>Local Time:</strong> ${localTime}</p>
            </div>
        `);
    });

    markerGroup.addTo(map);
}

async function fetchCountryBorders() {
    console.log("Fetching country borders");
    try {
        const response = await fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json");
        const data = await response.json();
        L.geoJson(data, {
            style: {
                color: "#4a90e2",
                weight: 1,
                fillOpacity: 0.2
            },
            onEachFeature: onEachFeature
        }).addTo(map);
    } catch (error) {
        console.error("Error loading GeoJSON data:", error);
    }
}

function onEachFeature(feature, layer) {
    layer.on({
        click: () => onCountryClick(feature)
    });
}

//custom timezones where there is data discrepancy 
const customTimezones = {
"United Kingdom": "UTC+00:00",  // Adjust to UTC+0 for UK
"Brazil": "UTC-03:00",          // Add any additional overrides as needed
// Add other countries with incorrect data if you find more
};


async function onCountryClick(feature) {
const countryName = feature.properties.name;
const requestUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`;
try {
const response = await fetch(requestUrl);
const countries = await response.json();
const countryData = countries.find(country => country.name.common.toLowerCase() === countryName.toLowerCase());

if (countryData) {
    const name = countryData.name.common;
    const flag = `https://flagcdn.com/${countryData.cca2.toLowerCase()}.svg`;
    const languages = countryData.languages ? Object.values(countryData.languages).join(", ") : "N/A";
    const currency = countryData.currencies ? Object.keys(countryData.currencies).join(", ") : "N/A";
    const timezone = customTimezones[name] || (countryData.timezones ? countryData.timezones[0] : "UTC"); // Use custom timezone if available
    const population = countryData.population ? countryData.population.toLocaleString() : "N/A";

    // Calculate local time using the correct timezone
    const localTime = getLocalTime(timezone);

    const popupContent = `
        <div style="text-align: center;">
            <h3>${name}</h3>
            <img src="${flag}" alt="${name} flag" style="width: 50px; height: auto; margin: 10px 0;">
        <div style="text-align: left;">
            <p><strong>Language:</strong> ${languages}</p>
            <p><strong>Currency:</strong> ${currency}</p>
            <p><strong>Population:</strong> ${population}</p>
            <p><strong>Timezone:</strong> ${timezone}</p>
            <p><strong>Local Time:</strong> ${localTime}</p>
        </div>
    `;

    L.popup({ maxWidth: 200 })
        .setLatLng(countryData.latlng)
        .setContent(popupContent)
        .openOn(map);
} else {
    console.error("Exact match not found for the selected country");
}
} catch (error) {
console.error("Fetch error:", error);
}
}

// Adjust the getLocalTime function as before
function getLocalTime(timezone) {
const now = new Date();
const offset = timezone.match(/UTC([+-]\d{2}):?(\d{2})?/);

if (offset) {
const hours = parseInt(offset[1], 10);
const minutes = offset[2] ? parseInt(offset[2], 10) : 0;
now.setUTCHours(now.getUTCHours() + hours);
now.setUTCMinutes(now.getUTCMinutes() + minutes);
}

return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


window.onload = () => {
    initMap();
    populateInitialData();
};