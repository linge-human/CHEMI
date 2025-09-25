// Data loading and workspace management

// Global data storage
let ionData = {};
let atomicMasses = {};
let calculationData = {};
let calculatorCounter = 0;

// Load external data on page load
async function loadData() {
    try {
        // Load ion lookup data
        const ionResponse = await fetch('./data/ion_lookup_vce.json');
        const ionDataObj = await ionResponse.json();
        ionData = ionDataObj.ions || {};
        atomicMasses = ionDataObj.atomicMasses || {};

        // Load calculator index to get list of individual calculator files
        const indexResponse = await fetch('./data/calculator-index.json');
        const indexData = await indexResponse.json();

        // Initialize calculation data structure
        calculationData = {};

        // Load each individual calculator file
        const loadPromises = indexData.calculators.map(async (calcInfo) => {
            try {
                const calcResponse = await fetch(`./data/${calcInfo.file}`);
                const calcData = await calcResponse.json();

                // Organize by category
                if (!calculationData[calcInfo.category]) {
                    calculationData[calcInfo.category] = [];
                }
                calculationData[calcInfo.category].push(calcData);

                log(`Loaded calculator: ${calcInfo.id}`);
            } catch (calcError) {
                console.error(`Failed to load calculator ${calcInfo.id}:`, calcError);
                showError('workspace', `Failed to load ${calcInfo.id} calculator`);
            }
        });

        // Wait for all calculators to load
        await Promise.all(loadPromises);

        log('All calculator data loaded successfully:', calculationData);
        initializeSidebar();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('workspace', 'Failed to load calculator data. Please refresh the page.');

        // Fallback data if file fails to load
        atomicMasses = {
            'H': 1.008, 'He': 4.003, 'Li': 6.94, 'Be': 9.012,
            'B': 10.81, 'C': 12.01, 'N': 14.01, 'O': 16.00,
            'F': 19.00, 'Ne': 20.18, 'Na': 22.99, 'Mg': 24.31,
            'Al': 26.98, 'Si': 28.09, 'P': 30.97, 'S': 32.07,
            'Cl': 35.45, 'Ar': 39.95, 'K': 39.10, 'Ca': 40.08,
            'Fe': 55.85, 'Cu': 63.55, 'Zn': 65.38, 'Br': 79.90,
            'Ag': 107.87, 'I': 126.90, 'Ba': 137.33, 'Au': 196.97
        };
        calculationData = {};
    }
}

// Save complete workspace state
function saveWorkspace() {
    const workspace = document.getElementById('workspace');
    const minimizedButtons = document.getElementById('minimizedButtons');

    const workspaceState = {
        calculators: [],
        minimizedCalculators: []
    };

    // Save visible workspace calculators
    workspace.querySelectorAll('.calc-card').forEach(card => {
        if (card.style.display !== 'none') {
            const calcData = extractCalculatorData(card);
            if (calcData) workspaceState.calculators.push(calcData);
        }
    });

    // Save minimized calculators
    minimizedButtons.querySelectorAll('.minimized-calc-btn').forEach(btn => {
        const calcId = btn.getAttribute('data-calc-id');
        const calcCard = document.getElementById(calcId);
        if (calcCard) {
            const calcData = extractCalculatorData(calcCard);
            if (calcData) workspaceState.minimizedCalculators.push(calcData);
        }
    });

    localStorage.setItem(CONFIG.STORAGE_KEYS.WORKSPACE, JSON.stringify(workspaceState));
}

// Extract calculator data for saving
function extractCalculatorData(calcCard) {
    const calcId = calcCard.id;
    const titleElement = calcCard.querySelector('.calc-title');
    const calcType = calcCard.getAttribute('data-calc-type');

    if (!titleElement || !calcType) return null;

    return {
        id: calcId,
        type: calcType,
        title: titleElement.textContent,
        isMinimized: calcCard.style.display === 'none'
    };
}

// Restore workspace from localStorage
function restoreWorkspace() {
    const savedWorkspace = localStorage.getItem(CONFIG.STORAGE_KEYS.WORKSPACE);
    if (!savedWorkspace) return;

    try {
        const workspaceState = JSON.parse(savedWorkspace);

        // Restore regular calculators
        workspaceState.calculators?.forEach(calcData => {
            // Add calculator without auto-close
            if (typeof addCalculatorToWorkspace === 'function') {
                addCalculatorToWorkspace(findCalculatorDefinition(calcData.type), false);
            }
        });

        // Restore minimized calculators
        workspaceState.minimizedCalculators?.forEach((calcData, index) => {
            const calcDef = findCalculatorDefinition(calcData.type);
            if (calcDef && typeof addCalculatorToWorkspace === 'function') {
                addCalculatorToWorkspace(calcDef, false);
                // Minimize it after adding with staggered timing
                setTimeout(() => {
                    const allCards = document.querySelectorAll(`[data-calc-type="${calcData.type}"]`);
                    const targetCard = allCards[allCards.length - 1]; // Get the most recently added one
                    if (targetCard && targetCard.style.display !== 'none' && typeof minimizeCalculator === 'function') {
                        minimizeCalculator(targetCard.id);
                    }
                }, CONFIG.ANIMATION_DELAY + (index * 50)); // Stagger the minimizing operations
            }
        });
    } catch (error) {
        console.error('Error restoring workspace:', error);
        showError('workspace', 'Failed to restore saved workspace');
    }
}

// Find calculator definition by type/id
function findCalculatorDefinition(calcType) {
    for (const category in calculationData) {
        const calc = calculationData[category].find(c => c.id === calcType);
        if (calc) return calc;
    }
    return null;
}

// Load and restore all user preferences
function loadUserPreferences() {
    restoreWorkspace();
}

// Save current unit states to localStorage
function saveUnitStates() {
    const unitStates = {};
    document.querySelectorAll('.unit-section').forEach(unit => {
        unitStates[unit.id] = unit.classList.contains('expanded');
    });
    localStorage.setItem(CONFIG.STORAGE_KEYS.UNIT_STATES, JSON.stringify(unitStates));
}