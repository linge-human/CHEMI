// Global data storage
let ionData = {};
let atomicMasses = {};

// Load external data on page load
async function loadData() {
    try {
        // Load ion lookup data
        const response = await fetch('./data/ion_lookup.json');
        const data = await response.json();
        ionData = data.ions || {};
        atomicMasses = data.atomicMasses || {};
        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
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
    }
}

// Initialize data when page loads
document.addEventListener('DOMContentLoaded', loadData);

// Navigation functions
function switchTab(tab, element) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tabEl => {
        tabEl.classList.remove('active');
    });
    
    // Show selected content
    document.getElementById(tab).classList.add('active');
    
    // Set active tab
    element.classList.add('active');
    
    // Show/hide clear all button
    const clearBtn = document.querySelector('.clear-all-btn');
    if (clearBtn) {
        if (tab === 'calculations') {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
    }
}

function showCategory(category, element) {
    // Update active category
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');
    
    // Here you would filter calculators by category
    // For now, just visual feedback
}

function clearAllCalculators() {
    const grid = document.getElementById('calculatorGrid');
    if (grid) {
        grid.innerHTML = '';
    }
}

// Calculation Functions
function calculateMoles() {
    const mass = parseFloat(document.getElementById('mole-mass').value);
    const molarMass = parseFloat(document.getElementById('mole-molar-mass').value);
    const resultElement = document.getElementById('mole-result');
    
    if (mass && molarMass && molarMass !== 0) {
        const moles = mass / molarMass;
        resultElement.textContent = `n = ${moles.toFixed(4)} mol`;
        
        // Show working
        if (document.getElementById('show-working-mole')?.checked) {
            resultElement.innerHTML += `<br><small>n = m/M = ${mass}/${molarMass} = ${moles.toFixed(4)} mol</small>`;
        }
    } else {
        resultElement.textContent = 'Please enter valid values';
    }
}

function calculateMolarity() {
    const moles = parseFloat(document.getElementById('molarity-moles').value);
    const volume = parseFloat(document.getElementById('molarity-volume').value);
    const resultElement = document.getElementById('molarity-result');
    
    if (moles && volume && volume !== 0) {
        const molarity = moles / volume;
        resultElement.textContent = `c = ${molarity.toFixed(4)} M`;
        
        // Show working
        if (document.getElementById('show-working-molarity')?.checked) {
            resultElement.innerHTML += `<br><small>c = n/V = ${moles}/${volume} = ${molarity.toFixed(4)} mol/L</small>`;
        }
    } else {
        resultElement.textContent = 'Please enter valid values';
    }
}

function convertTemperature() {
    const value = parseFloat(document.getElementById('temp-value').value);
    const from = document.getElementById('temp-from').value;
    const to = document.getElementById('temp-to').value;
    const resultElement = document.getElementById('temp-result');
    
    if (isNaN(value)) {
        resultElement.textContent = 'Please enter a temperature';
        return;
    }
    
    let result;
    let celsius;
    let working = '';
    
    // Convert to Celsius first
    if (from === 'C') {
        celsius = value;
    } else if (from === 'K') {
        celsius = value - 273.15;
        working += `K to °C: ${value} - 273.15 = ${celsius.toFixed(2)}°C\n`;
    } else if (from === 'F') {
        celsius = (value - 32) * 5/9;
        working += `°F to °C: (${value} - 32) × 5/9 = ${celsius.toFixed(2)}°C\n`;
    }
    
    // Convert from Celsius to target
    if (to === 'C') {
        result = celsius;
    } else if (to === 'K') {
        result = celsius + 273.15;
        working += `°C to K: ${celsius.toFixed(2)} + 273.15 = ${result.toFixed(2)} K`;
    } else if (to === 'F') {
        result = celsius * 9/5 + 32;
        working += `°C to °F: ${celsius.toFixed(2)} × 9/5 + 32 = ${result.toFixed(2)}°F`;
    }
    
    resultElement.textContent = `${result.toFixed(2)} ${to === 'C' ? '°C' : to === 'F' ? '°F' : 'K'}`;
    
    if (document.getElementById('show-working-temp')?.checked && working) {
        resultElement.innerHTML += `<br><small>${working}</small>`;
    }
}

function calculatePH() {
    const concentration = document.getElementById('ph-concentration').value;
    const resultElement = document.getElementById('ph-result');
    
    try {
        const conc = parseFloat(concentration);
        if (conc > 0) {
            const pH = -Math.log10(conc);
            const pOH = 14 - pH;
            resultElement.textContent = `pH = ${pH.toFixed(2)}, pOH = ${pOH.toFixed(2)}`;
            
            // Show working
            if (document.getElementById('show-working-ph')?.checked) {
                resultElement.innerHTML += `<br><small>pH = -log[H⁺] = -log(${conc.toExponential(2)}) = ${pH.toFixed(2)}<br>`;
                resultElement.innerHTML += `pOH = 14 - pH = 14 - ${pH.toFixed(2)} = ${pOH.toFixed(2)}</small>`;
            }
        } else {
            resultElement.textContent = 'Enter a positive concentration';
        }
    } catch (e) {
        resultElement.textContent = 'Invalid input';
    }
}

function calculateDilution() {
    const c1 = parseFloat(document.getElementById('dil-c1').value);
    const v1 = parseFloat(document.getElementById('dil-v1').value);
    const c2 = parseFloat(document.getElementById('dil-c2').value);
    const v2 = parseFloat(document.getElementById('dil-v2').value);
    const resultElement = document.getElementById('dilution-result');
    
    let result = '';
    let working = '';
    
    if (c1 && v1 && c2 && !v2) {
        const v2Calc = (c1 * v1) / c2;
        result = `V₂ = ${v2Calc.toFixed(2)} mL`;
        working = `C₁V₁ = C₂V₂\n${c1} × ${v1} = ${c2} × V₂\nV₂ = (${c1} × ${v1})/${c2} = ${v2Calc.toFixed(2)} mL`;
    } else if (c1 && v1 && !c2 && v2) {
        const c2Calc = (c1 * v1) / v2;
        result = `C₂ = ${c2Calc.toFixed(4)} M`;
        working = `C₁V₁ = C₂V₂\n${c1} × ${v1} = C₂ × ${v2}\nC₂ = (${c1} × ${v1})/${v2} = ${c2Calc.toFixed(4)} M`;
    } else if (c1 && !v1 && c2 && v2) {
        const v1Calc = (c2 * v2) / c1;
        result = `V₁ = ${v1Calc.toFixed(2)} mL`;
        working = `C₁V₁ = C₂V₂\n${c1} × V₁ = ${c2} × ${v2}\nV₁ = (${c2} × ${v2})/${c1} = ${v1Calc.toFixed(2)} mL`;
    } else if (!c1 && v1 && c2 && v2) {
        const c1Calc = (c2 * v2) / v1;
        result = `C₁ = ${c1Calc.toFixed(4)} M`;
        working = `C₁V₁ = C₂V₂\nC₁ × ${v1} = ${c2} × ${v2}\nC₁ = (${c2} × ${v2})/${v1} = ${c1Calc.toFixed(4)} M`;
    } else {
        result = 'Leave exactly one field blank';
    }
    
    resultElement.textContent = result;
    
    if (document.getElementById('show-working-dilution')?.checked && working) {
        resultElement.innerHTML = result + `<br><small>${working.replace(/\n/g, '<br>')}</small>`;
    }
}

function calculatePercentYield() {
    const actual = parseFloat(document.getElementById('yield-actual').value);
    const theoretical = parseFloat(document.getElementById('yield-theoretical').value);
    const resultElement = document.getElementById('yield-result');
    
    if (actual && theoretical && theoretical !== 0) {
        const percentYield = (actual / theoretical) * 100;
        resultElement.textContent = `Percent Yield = ${percentYield.toFixed(2)}%`;
        
        // Show working
        if (document.getElementById('show-working-yield')?.checked) {
            resultElement.innerHTML += `<br><small>% Yield = (Actual/Theoretical) × 100<br>`;
            resultElement.innerHTML += `= (${actual}/${theoretical}) × 100 = ${percentYield.toFixed(2)}%</small>`;
        }
    } else {
        resultElement.textContent = 'Please enter valid values';
    }
}

function calculateIonCharge() {
    const symbol = document.getElementById('ion-symbol').value.trim();
    const resultElement = document.getElementById('ion-result');
    
    // Check various formats
    const upperSymbol = symbol.toUpperCase();
    const capitalizedSymbol = symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
    
    let foundIon = null;
    let charge = null;
    
    // Search in the loaded ion data
    if (ionData[symbol]) {
        foundIon = symbol;
        charge = ionData[symbol].charge;
    } else if (ionData[upperSymbol]) {
        foundIon = upperSymbol;
        charge = ionData[upperSymbol].charge;
    } else if (ionData[capitalizedSymbol]) {
        foundIon = capitalizedSymbol;
        charge = ionData[capitalizedSymbol].charge;
    }
    
    if (foundIon && charge) {
        resultElement.innerHTML = `${foundIon}: ${charge}`;
        if (ionData[foundIon].name) {
            resultElement.innerHTML += `<br><small>${ionData[foundIon].name}</small>`;
        }
    } else {
        resultElement.textContent = 'Ion not found in database';
    }
}

function calculateMolarMass() {
    const formula = document.getElementById('formula-input').value.trim();
    const resultElement = document.getElementById('molar-mass-result');
    
    if (!formula) {
        resultElement.textContent = 'Please enter a formula';
        return;
    }
    
    try {
        // Parse the formula and calculate molar mass
        const mass = parseMolecularFormula(formula);
        
        if (mass > 0) {
            resultElement.textContent = `M = ${mass.toFixed(2)} g/mol`;
            
            // Show breakdown if requested
            if (document.getElementById('show-working-molar')?.checked) {
                const breakdown = getFormulaBreakdown(formula);
                if (breakdown) {
                    resultElement.innerHTML += `<br><small>${breakdown}</small>`;
                }
            }
        } else {
            resultElement.textContent = 'Unable to calculate - check formula';
        }
    } catch (e) {
        resultElement.textContent = 'Invalid formula format';
    }
}

// Helper function to parse molecular formulas
function parseMolecularFormula(formula) {
    // First check if it's a common compound in our data
    const upperFormula = formula.toUpperCase().replace(/\s/g, '');
    
    // Common compounds lookup (if you have this in your JSON)
    const commonCompounds = {
        'H2O': 18.015,
        'CO2': 44.01,
        'NACL': 58.44,
        'H2SO4': 98.08,
        'HCL': 36.46,
        'NAOH': 40.00,
        'CH4': 16.04,
        'C2H6': 30.07,
        'C6H12O6': 180.16,
        'CACO3': 100.09,
        'NH3': 17.03,
        'H2O2': 34.01,
        'KMNO4': 158.03
    };
    
    if (commonCompounds[upperFormula]) {
        return commonCompounds[upperFormula];
    }
    
    // Try to parse the formula
    let totalMass = 0;
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match;
    
    while ((match = regex.exec(formula)) !== null) {
        const element = match[1];
        const count = match[2] ? parseInt(match[2]) : 1;
        
        if (atomicMasses[element]) {
            totalMass += atomicMasses[element] * count;
        } else {
            // Element not found
            return 0;
        }
    }
    
    return totalMass;
}

// Helper function to show formula breakdown
function getFormulaBreakdown(formula) {
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match;
    let breakdown = [];
    
    while ((match = regex.exec(formula)) !== null) {
        const element = match[1];
        const count = match[2] ? parseInt(match[2]) : 1;
        
        if (atomicMasses[element]) {
            const mass = atomicMasses[element] * count;
            breakdown.push(`${element}: ${atomicMasses[element]} × ${count} = ${mass.toFixed(2)}`);
        }
    }
    
    return breakdown.length > 0 ? breakdown.join('<br>') : null;
}

// Add new calculator cards dynamically
function addCalculator(type) {
    const grid = document.getElementById('calculatorGrid');
    if (!grid) return;
    
    const templates = {
        'molarMass': `
            <div class="calc-card">
                <div class="calc-header">
                    <span class="calc-title">Molar Mass</span>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="input-group">
                    <input type="text" class="input-field" id="formula-input-new" placeholder="Chemical Formula (e.g., H₂SO₄)">
                </div>
                <label><input type="checkbox" id="show-working-molar-new"> Show working</label>
                <button class="calc-button" onclick="calculateMolarMassNew()">Calculate</button>
                <div class="result-display" id="molar-mass-result-new"></div>
            </div>
        `,
        'percentComposition': `
            <div class="calc-card">
                <div class="calc-header">
                    <span class="calc-title">Percent Composition</span>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="input-group">
                    <input type="text" class="input-field" placeholder="Chemical Formula">
                </div>
                <button class="calc-button">Calculate</button>
                <div class="result-display"></div>
            </div>
        `,
        'ionCharge': `
            <div class="calc-card">
                <div class="calc-header">
                    <span class="calc-title">Ion Charge</span>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="input-group">
                    <input type="text" class="input-field" placeholder="Ion Symbol">
                </div>
                <button class="calc-button">Calculate</button>
                <div class="result-display"></div>
            </div>
        `,
        'solubility': `
            <div class="calc-card">
                <div class="calc-header">
                    <span class="calc-title">Solubility Check</span>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="input-group">
                    <input type="text" class="input-field" placeholder="Compound Formula">
                </div>
                <button class="calc-button">Check Solubility</button>
                <div class="result-display"></div>
            </div>
        `
    };
    
    if (templates[type]) {
        const newCard = document.createElement('div');
        newCard.innerHTML = templates[type];
        grid.appendChild(newCard.firstElementChild);
    }
}

// Additional calculation functions for dynamically added calculators
function calculateMolarMassNew() {
    // This would be for newly added molar mass calculators
    // Implementation similar to calculateMolarMass but with different IDs
}
