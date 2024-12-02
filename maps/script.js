// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add a CartoDB Positron tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.carto.com/">CARTO</a> contributors',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Global Variables
let geojsonData = null; // Countries GeoJSON
let usStatesGeoJSON = null; // US States GeoJSON
let usStatesLayer = null; // US States Layer
let geojsonLayer = null; // Countries Layer
let countryCodeMap = {}; // ISO Codes for Flags

// Utility to map country names to ISO codes
const getCountryCode = (country) => {
    const code = countryCodeMap[country.toLowerCase()];
    if (!code) {
        console.warn(`No ISO code found for country: ${country}`);
    }
    return code || "unknown"; // Return "unknown" if no match is found
};

// Function to check if a location is a US state
const isUSState = (location, usStatesGeoJSON) => {
    return usStatesGeoJSON.features.some(feature => feature.properties.name === location);
};

// Resolve mismatched country names
const resolveCountryName = (name, target) => {
    const countryNameMapping = {
        "United States of America": "United States",
        "United Kingdom": "United Kingdom of Great Britain and Northern Ireland",
    };

    if (target === "geojson") {
        return Object.keys(countryNameMapping).find(key => countryNameMapping[key] === name) || name;
    } else if (target === "flagcdn") {
        return countryNameMapping[name] || name;
    }
    return name;
};

        // Travel data
        const travelData = {
            1989: ["Lithuania"], //Born
            2000: ["Ireland"], //?? Visited mother in Ireland. Several times, need to confirm exact years.
            2003: ["Ireland"], //?? Visited mother in Ireland. Several times, need to confirm exact years. 
            2004: ["Ireland"], //?? Visited mother in Ireland. Several times, need to confirm exact years. 
            2005: ["Germany"], //Karate camp :D
            2009: ["Germany", "Poland", "United Kingdom", "Ireland"], //konferencja biznesowa [PL], Hamburg, London, moved to Ireland.
            2010: ["Lithuania"], //with Noel.
            2011: ["Spain"], //Ibiza
            2012: ["Lithuania"], //Moved back to Lithuania
            2013: ["Ireland"], //Moved back to Ireland
            2014: ["Spain"], //Ibiza 2
            2015: ["Spain"], //VMworld Barcelona
            2016: ["Denmark", "France", "United Kingdom", "France", "Denmark", "Lithuania"], // Copenhagen, Archachon, Work Trip UK and Paris
            2017: ["California", "Spain", "Netherlands", "Lithuania"], //San Francisco, Primavera#1, 4x ING trip to Amsterdam
            2018: ["Italy", "Netherlands", "Spain", "Massachusetts", "Rhode Island","Lithuania"], //Como, Rotterdam, Primavera#2, Rhode Island 
            2019: ["Scotland", "Switzerland", "Poland", "Spain","Lithuania"], //Primavera#3
            2020: ["Thailand", "Laos", "Vietnam", "Cambodia", "Malaysia"],
            2021: ["Portugal", "Netherlands","Lithuania"],
            2022: ["Netherlands","Scotland", "Spain","Lithuania"], //Primavera4
            2023: ["Netherlands","Japan", "Malta"],
            2024: ["Lithuania", "Germany", "Austria", "Jordan", "Sri Lanka", "Philippines", "South Korea", "Japan", "Thailand", "France"]
        };

// Load GeoJSON and Flag CDN Data
Promise.all([
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json').then(res => res.json()),
    fetch('path-to-us-states-geojson.json').then(res => res.json()),
    fetch('https://flagcdn.com/en/codes.json').then(res => res.json())
])
    .then(([countriesData, statesData, flagData]) => {
        geojsonData = countriesData;
        usStatesGeoJSON = statesData;
        countryCodeMap = Object.fromEntries(
            Object.entries(flagData).map(([code, name]) => [name.toLowerCase(), code])
        );

        // Initialize Map and Slider
        const yearSlider = document.getElementById('year-slider');
        const selectedYear = document.getElementById('selected-year');
        yearSlider.addEventListener('input', () => {
            const year = parseInt(yearSlider.value);
            selectedYear.textContent = year;

            highlightCountries(year);
            updateStateHighlights(year);
            createFlagBarChart(year);
        });

        // Initial Setup
        const initialYear = parseInt(yearSlider.value);
        highlightCountries(initialYear);
        updateStateHighlights(initialYear);
        createFlagBarChart(initialYear);
    })
    .catch(error => console.error("Error loading data:", error));

// Highlight Visited Countries
const highlightCountries = (currentYear) => {
    const visitData = {};
    let usaVisited = false;

    for (let year = 1989; year <= currentYear; year++) {
        if (travelData[year]) {
            travelData[year].forEach((location) => {
                if (isUSState(location, usStatesGeoJSON)) {
                    usaVisited = true;
                } else {
                    const geojsonName = resolveCountryName(location, "geojson");
                    if (!visitData[geojsonName]) {
                        visitData[geojsonName] = { count: 0, years: [] };
                    }
                    visitData[geojsonName].count += 1;
                    visitData[geojsonName].years.push(year);
                }
            });
        }
    }

    if (geojsonLayer) map.removeLayer(geojsonLayer);

    const filteredGeoJSON = {
        type: "FeatureCollection",
        features: geojsonData.features.filter(feature =>
            visitData[feature.properties.name]
        )
    };

    geojsonLayer = L.geoJSON(filteredGeoJSON, {
        style: { color: "#48c400", weight: 2, fillOpacity: 0.5 },
        onEachFeature: (feature, layer) => {
            const country = feature.properties.name;
            if (visitData[country]) {
                layer.bindTooltip(`<strong>${country}</strong><br>Visits: ${visitData[country].count}`);
            }
        }
    }).addTo(map);

    const totalVisited = Object.keys(visitData).length + (usaVisited ? 1 : 0);
    document.getElementById("country-count").textContent = totalVisited;
};

// Highlight Visited US States
const updateStateHighlights = (currentYear) => {
    const visitedStates = Object.keys(travelData)
        .filter(year => year <= currentYear)
        .reduce((states, year) => [...states, ...travelData[year]], [])
        .filter(location => isUSState(location, usStatesGeoJSON));

    if (usStatesLayer) map.removeLayer(usStatesLayer);

    usStatesLayer = L.geoJSON(usStatesGeoJSON, {
        style: (feature) => ({
            color: visitedStates.includes(feature.properties.name) ? "#48c400" : "#cccccc",
            weight: visitedStates.includes(feature.properties.name) ? 2 : 1,
            fillOpacity: visitedStates.includes(feature.properties.name) ? 0.6 : 0.1
        }),
        onEachFeature: (feature, layer) => {
            if (visitedStates.includes(feature.properties.name)) {
                layer.bindTooltip(feature.properties.name);
            }
        }
    }).addTo(map);
};

// Create Flag Bar Chart
const createFlagBarChart = (currentYear) => {
    const visitCounts = {}; // Tracks visits by country
    const usVisitedYears = new Set(); // Tracks years when US states were visited

    for (let year = 1989; year <= currentYear; year++) {
        if (travelData[year]) {
            travelData[year].forEach((location) => {
                // Group US states under "United States"
                if (isUSState(location, usStatesGeoJSON)) {
                    if (!usVisitedYears.has(year)) {
                        usVisitedYears.add(year);
                        visitCounts["United States"] = (visitCounts["United States"] || 0) + 1;
                    }
                } else {
                    visitCounts[location] = (visitCounts[location] || 0) + 1;
                }
            });
        }
    }

    console.log("Visit Counts (Bar Chart):", visitCounts); // Debugging

    const chartContainer = document.getElementById("flag-bar-chart");
    chartContainer.innerHTML = ""; // Clear existing chart

    Object.keys(visitCounts).forEach((name) => {
        const code = getCountryCode(name);
        if (code === "unknown") {
            console.warn(`No code found for: ${name}`); // Debugging
            return; // Skip countries with no valid code
        }

        // Create a bar for the country
        const bar = document.createElement("div");
        bar.className = "flag-bar";

        // Add flags for each visit
        for (let i = 0; i < visitCounts[name]; i++) {
            const flag = document.createElement("img");
            flag.src = `https://flagcdn.com/w40/${code}.png`;
            flag.alt = `${name} Flag`;
            bar.appendChild(flag);
        }

        // Add a label for the country
        const label = document.createElement("span");
        label.textContent = name; // Display only the country name
        bar.appendChild(label);

        chartContainer.appendChild(bar);
    });
};



// Toggle chart visibility
document.getElementById("toggle-chart-btn").addEventListener("click", () => {
    const chartContainer = document.getElementById("flag-bar-chart");
    const toggleButton = document.getElementById("toggle-chart-btn");

    if (chartContainer.style.display === "none") {
        chartContainer.style.display = "flex"; // Show the chart
        toggleButton.textContent = "Hide Flag Bar Chart";

        // Add a delay to let layout stabilize before populating
        setTimeout(() => {
            createFlagBarChart(yearSlider.value);
        }, 100); // Adjust delay as needed
    } else {
        chartContainer.style.display = "none"; // Hide the chart
        toggleButton.textContent = "Show Flag Bar Chart";
    }
});

