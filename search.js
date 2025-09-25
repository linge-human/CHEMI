// Search functionality

// Quick search functionality
function initializeQuickSearch() {
    const searchInput = document.getElementById('quickSearch');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        // Debounce search
        searchTimeout = setTimeout(() => {
            performSearch(query, searchResults);
        }, 300);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            searchResults.style.display = 'none';
        }
    });
}

function performSearch(query, resultsContainer) {
    const results = [];

    // Search through calculators
    for (const category in calculationData) {
        calculationData[category].forEach(calc => {
            if (calc.title.toLowerCase().includes(query) ||
                calc.description.toLowerCase().includes(query) ||
                (calc.formula && calc.formula.toLowerCase().includes(query))) {
                results.push({
                    type: 'calculator',
                    data: calc
                });
            }
        });
    }

    displaySearchResults(results, resultsContainer);
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No results found</div>';
        container.style.display = 'block';
        return;
    }

    let html = '';
    results.forEach(result => {
        if (result.type === 'calculator') {
            html += `
                <div class="search-result-item" onclick="addCalculatorByType('${result.data.id}')">
                    <i class="fas fa-calculator"></i>
                    <div>
                        <div class="result-title">${result.data.title}</div>
                        <div class="result-desc">${result.data.description}</div>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
    container.style.display = 'block';
}