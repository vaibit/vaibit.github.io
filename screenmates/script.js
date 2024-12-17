// Debounce function to limit API calls
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Enhanced error handling and UI feedback
function showLoadingState(isLoading) {
    const compareBtn = document.getElementById('compare-btn');
    const resultsDiv = document.getElementById('results');

    if (isLoading) {
        compareBtn.disabled = true;
        compareBtn.innerHTML = 'Comparing...';
        resultsDiv.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Searching for common credits...</p>
            </div>
        `;
    } else {
        compareBtn.disabled = false;
        compareBtn.innerHTML = 'Compare';
    }
}

// Cache recent searches to reduce API calls
const searchCache = new Map();

async function searchMovies(query) {
    // Check cache first
    if (searchCache.has(query)) {
        return searchCache.get(query);
    }

    if (query.trim().length < 2) return [];

    const searchUrl = `https://tmdb-proxy-server.onrender.com/api/search/multi?query=${query}`;
    
    try {
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        const suggestions = data.results
            .filter(result => ['movie', 'tv'].includes(result.media_type))
            .map(result => ({
                id: result.id,
                title: result.title || result.name,
                year: result.release_date ? result.release_date.split('-')[0] : 
                       result.first_air_date ? result.first_air_date.split('-')[0] : '',
                type: result.media_type,
                poster: result.poster_path 
                    ? `https://image.tmdb.org/t/p/w92${result.poster_path}` 
                    : null
            }))
            .slice(0, 5);
        
        // Cache the results
        searchCache.set(query, suggestions);
        
        return suggestions;
    } catch (error) {
        console.error('Error searching for movies:', error);
        return [];
    }
}

function createAutocomplete(inputElement, suggestionsContainer) {
    inputElement.addEventListener('input', debounce(async (e) => {
        const query = e.target.value;
        const suggestions = await searchMovies(query);
        
        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';
        
        if (suggestions.length === 0) return;
        
        // Create suggestion elements
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('suggestion-item');
            suggestionElement.innerHTML = `
                ${suggestion.title} 
                <span class="suggestion-year">(${suggestion.year}) - ${suggestion.type}</span>
            `;
            
            suggestionElement.addEventListener('click', () => {
                inputElement.value = suggestion.title;
                suggestionsContainer.innerHTML = ''; // Clear suggestions
            });
            
            suggestionsContainer.appendChild(suggestionElement);
        });
    }, 300));

    // Close suggestions if clicked outside
    document.addEventListener('click', (e) => {
        if (!suggestionsContainer.contains(e.target) && e.target !== inputElement) {
            suggestionsContainer.innerHTML = '';
        }
    });
}

async function searchMovie(title) {
    const searchUrl = `https://tmdb-proxy-server.onrender.com/api/search/multi?query=${title}`;
    
    try {
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        // Return the first result (most relevant)
        return data.results[0];
    } catch (error) {
        console.error('Error searching for movie:', error);
        return null;
    }
}

async function getCredits(id, type) {
    const creditsUrl = `https://tmdb-proxy-server.onrender.com/api/${type}/${id}/credits`;
    
    try {
        const response = await fetch(creditsUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching credits:', error);
        return null;
    }
}

function findCommonCredits(credits1, credits2) {
    const commonCredits = [];
    
    // Combine cast and crew
    const cast1 = credits1.cast || [];
    const crew1 = credits1.crew || [];
    const cast2 = credits2.cast || [];
    const crew2 = credits2.crew || [];
    
    const allCredits1 = [...cast1, ...crew1];
    const allCredits2 = [...cast2, ...crew2];
    
    allCredits1.forEach(credit1 => {
        const matchingCredit = allCredits2.find(credit2 => 
            credit1.id === credit2.id && 
            // Ensure we're not matching random people with same ID
            (credit1.name === credit2.name)
        );
        
        if (matchingCredit) {
            commonCredits.push({
                name: credit1.name,
                character1: credit1.character || credit1.job,
                character2: matchingCredit.character || matchingCredit.job,
                type: credit1.character ? 'actor' : 'crew'
            });
        }
    });
    
    return commonCredits;
}

async function compareMovies() {
    const movie1Input = document.getElementById('movie1');
    const movie2Input = document.getElementById('movie2');
    const resultsDiv = document.getElementById('results');
    
    try {
        // Show loading state
        showLoadingState(true);
        
        // Search for both movies
        const movie1 = await searchMovie(movie1Input.value);
        const movie2 = await searchMovie(movie2Input.value);
        
        if (!movie1 || !movie2) {
            throw new Error('Could not find one or both of the movies/TV series.');
        }
        
        // Get credits for both
        const credits1 = await getCredits(movie1.id, movie1.media_type);
        const credits2 = await getCredits(movie2.id, movie2.media_type);
        
        if (!credits1 || !credits2) {
            throw new Error('Could not fetch credits for the movies/TV series.');
        }
        
        // Find common credits
        const commonCredits = findCommonCredits(credits1, credits2);
        
        // Display results with enhanced information
        if (commonCredits.length > 0) {
            const resultsHtml = commonCredits.map(credit => `
                <div class="common-actor">
                    <div class="actor-header">
                        <span class="actor-name">${credit.name}</span>
                        <span class="credit-count">${credit.type}</span>
                    </div>
                    <div class="credit-details">
                        ${credit.type === 'actor' 
                            ? `Roles: "${credit.character1}" in ${movie1.title || movie1.name}, "${credit.character2}" in ${movie2.title || movie2.name}`
                            : `Crew Position: "${credit.character1}" in ${movie1.title || movie1.name}, "${credit.character2}" in ${movie2.title || movie2.name}`
                        }
                    </div>
                </div>
            `).join('');
            
            resultsDiv.innerHTML = `
            <div class="results-container">
                <div class="results-header">
                    <h2 class="results-title">Common Credits</h2>
                    <div class="separator">

                    <div class="credit-summary">
                        <div class="summary-stat">
                            <span class="stat-label">Total Common Credits:</span>
                            <span class="stat-value">${commonCredits.length}</span>
                        </div>
<div class="separator">

                        <div class="summary-movies">
                            <span class="stat-label">Movies:</span>
                            <span class="stat-value">"${movie1.title || movie1.name}" and "${movie2.title || movie2.name}"</span>
                        </div>
                    </div>
                </div>
            </div>
                ${resultsHtml}
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="no-results">
                    <p>No common actors or crew found between "${movie1.title || movie1.name}" and "${movie2.title || movie2.name}".</p>
                    <p>Try different movies or check for spelling variations.</p>
                </div>
            `;
        }
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="error-message">
                <h3>Oops! Something went wrong</h3>
                <p>${error.message}</p>
                <p>Please check your internet connection or try again later.</p>
            </div>
        `;
    } finally {
        // Always remove loading state
        showLoadingState(false);
    }
}


// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const movie1Input = document.getElementById('movie1');
    const movie2Input = document.getElementById('movie2');
    const suggestions1 = document.getElementById('suggestions1');
    const suggestions2 = document.getElementById('suggestions2');

    // Create autocomplete for both input fields
    createAutocomplete(movie1Input, suggestions1);
    createAutocomplete(movie2Input, suggestions2);

    // Add event listener to compare button
    document.getElementById('compare-btn').addEventListener('click', compareMovies);
});