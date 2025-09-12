// CHEMI - Advanced Chemistry Calculator Engine
// Main JavaScript file for handling all calculations and UI interactions

class ChemiCalculator {
    constructor() {
        this.calculationsData = {};
        this.lookupData = [];
        this.currentCategory = 'all';
        this.favorites = JSON.parse(localStorage.getItem('chemi-favorites')) || [];
        this.searchTerm = '';
        this.init();
    }

    // Initialize the application
    async init() {
        try {
            await this.loadData();
            this.setupCalculationMethods();
            this.renderCalculators();
            this.updateCounts();
            this.setupEventListeners();
            this.setupLookupSystem();
        } catch (error) {
            console.error('Failed to initialize CHEMI:', error);
            this.showError('Failed to load calculation data. Please refresh the page.');
        }
    }

    // Load data from JSON file
    async loadData() {
        try {
            const response = await fetch('data/chemi.json');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            this.calculationsData = data.calculations;
            this.lookupData = data.lookup_data;
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to embedded data if file loading fails
            this.loadFallbackData();
        }
    }

    // Fallback data if JSON file fails to load
    loadFallbackData() {
        this.calculationsData = {
            "stoichiometry": [
                {
                    "id": "moles-mass",
                    "title": "Moles to Mass",
                    "formula": "m = n × M",
                    "description": "Calculate mass from moles and molar mass",
                    "inputs": [
                        {"id": "moles", "label": "Moles (n)", "unit": "mol", "type": "number"},
                        {"id": "molar_mass", "label": "Molar Mass (M)", "unit": "g/mol", "type": "number"}
                    ]
                }
                // Add more fallback data as needed...
            ]
        };
        
        this.lookupData = [
            {
                "term": "Avogadro's Number",
                "formula": "6.022 × 10²³ particles/mol",
                "description": "Number of particles in one mole"
            }
            // Add more fallback lookup data...
        ];
    }

    // Setup calculation methods for each calculator
    setupCalculationMethods() {
        const calculations = {
            // Stoichiometry calculations
            "moles-mass": (inputs) => {
                const mass = inputs.moles * inputs.molar_mass;
                return {
                    result: `${mass.toFixed(3)} g`,
                    formula: `m = ${inputs.moles} mol × ${inputs.molar_mass} g/mol = ${mass.toFixed(3)} g`
                };
            },
            
            "mass-moles": (inputs) => {
                const moles = inputs.mass / inputs.molar_mass;
                return {
                    result: `${moles.toFixed(3)} mol`,
                    formula: `n = ${inputs.mass} g / ${inputs.molar_mass} g/mol = ${moles.toFixed(3)} mol`
                };
            },
            
            "molarity": (inputs) => {
                const molarity = inputs.moles / inputs.volume;
                return {
                    result: `${molarity.toFixed(3)} M`,
                    formula: `C = ${inputs.moles} mol / ${inputs.volume} L = ${molarity.toFixed(3)} M`
                };
            },
            
            "ideal-gas": (inputs) => {
                const R = 0.08206;
                const calculated_P = (inputs.moles * R * inputs.temperature) / inputs.volume;
                return {
                    result: `P = ${calculated_P.toFixed(3)} atm`,
                    formula: `P = nRT/V = ${inputs.moles} × ${R} × ${inputs.temperature} / ${inputs.volume} = ${calculated_P.toFixed(3)} atm`
                };
            },
            
            "stp-volume": (inputs) => {
                const volume = inputs.moles * 22.4;
                return {
                    result: `${volume.toFixed(3)} L`,
                    formula: `V = ${inputs.moles} mol × 22.4 L/mol = ${volume.toFixed(3)} L`
                };
            },
            
            "percent-yield": (inputs) => {
                const percent = (inputs.actual / inputs.theoretical) * 100;
                return {
                    result: `${percent.toFixed(2)}%`,
                    formula: `% Yield = (${inputs.actual} g / ${inputs.theoretical} g) × 100 = ${percent.toFixed(2)}%`
                };
            },
            
            "limiting-reagent": (inputs) => {
                const ratio_a = inputs.moles_a / inputs.coeff_a;
                const ratio_b = inputs.moles_b / inputs.coeff_b;
                const limiting = ratio_a < ratio_b ? "Reactant A" : "Reactant B";
                return {
                    result: `${limiting} is limiting`,
                    formula: `Ratio A: ${ratio_a.toFixed(3)}, Ratio B: ${ratio_b.toFixed(3)}`
                };
            },
            
            "empirical-formula": (inputs) => {
                const masses = inputs.elements.split(',').map(x => parseFloat(x.trim()));
                const total = masses.reduce((sum, mass) => sum + mass, 0);
                return {
                    result: `${total.toFixed(3)} g/mol`,
                    formula: `Empirical Formula Mass = ${masses.join(' + ')} = ${total.toFixed(3)} g/mol`
                };
            },

            // Solution Chemistry calculations
            "dilution": (inputs) => {
                const v2 = (inputs.c1 * inputs.v1) / inputs.c2;
                return {
                    result: `V₂ = ${v2.toFixed(2)} mL`,
                    formula: `V₂ = C₁V₁/C₂ = ${inputs.c1} × ${inputs.v1} / ${inputs.c2} = ${v2.toFixed(2)} mL`
                };
            },
            
            "percent-ww": (inputs) => {
                const percent = (inputs.mass_solute / inputs.mass_solution) * 100;
                return {
                    result: `${percent.toFixed(2)}% w/w`,
                    formula: `% w/w = (${inputs.mass_solute} g / ${inputs.mass_solution} g) × 100 = ${percent.toFixed(2)}%`
                };
            },
            
            "percent-wv": (inputs) => {
                const percent = (inputs.mass_solute / inputs.volume_solution) * 100;
                return {
                    result: `${percent.toFixed(2)}% w/v`,
                    formula: `% w/v = (${inputs.mass_solute} g / ${inputs.volume_solution} mL) × 100 = ${percent.toFixed(2)}%`
                };
            },
            
            "percent-vv": (inputs) => {
                const percent = (inputs.volume_solute / inputs.volume_solution) * 100;
                return {
                    result: `${percent.toFixed(2)}% v/v`,
                    formula: `% v/v = (${inputs.volume_solute} mL / ${inputs.volume_solution} mL) × 100 = ${percent.toFixed(2)}%`
                };
            },
            
            "ppm": (inputs) => {
                const ppm = (inputs.mass_solute / (inputs.mass_solution * 1000)) * 1000000;
                return {
                    result: `${ppm.toFixed(2)} ppm`,
                    formula: `ppm = (${inputs.mass_solute} mg / ${inputs.mass_solution * 1000} g) × 10⁶ = ${ppm.toFixed(2)} ppm`
                };
            },
            
            "molality": (inputs) => {
                const molality = inputs.moles_solute / inputs.kg_solvent;
                return {
                    result: `${molality.toFixed(3)} m`,
                    formula: `m = ${inputs.moles_solute} mol / ${inputs.kg_solvent} kg = ${molality.toFixed(3)} m`
                };
            },

            // Acids & Bases calculations
            "ph-calculation": (inputs) => {
                const ph = -Math.log10(inputs.h_concentration);
                return {
                    result: `pH = ${ph.toFixed(2)}`,
                    formula: `pH = -log₁₀(${inputs.h_concentration}) = ${ph.toFixed(2)}`
                };
            },
            
            "h-concentration": (inputs) => {
                const h_conc = Math.pow(10, -inputs.ph);
                return {
                    result: `[H⁺] = ${h_conc.toExponential(2)} M`,
                    formula: `[H⁺] = 10⁻${inputs.ph} = ${h_conc.toExponential(2)} M`
                };
            },
            
            "poh-calculation": (inputs) => {
                const poh = 14 - inputs.ph;
                return {
                    result: `pOH = ${poh.toFixed(2)}`,
                    formula: `pOH = 14 - ${inputs.ph} = ${poh.toFixed(2)}`
                };
            },
            
            "titration": (inputs) => {
                const c_base = (inputs.c_acid * inputs.v_acid) / inputs.v_base;
                return {
                    result: `Base Concentration = ${c_base.toFixed(3)} M`,
                    formula: `C₂ = C₁V₁/V₂ = ${inputs.c_acid} × ${inputs.v_acid} / ${inputs.v_base} = ${c_base.toFixed(3)} M`
                };
            },

            // Redox & Electrochemistry calculations
            "cell-potential": (inputs) => {
                const cell_potential = inputs.cathode_potential - inputs.anode_potential;
                return {
                    result: `E°cell = ${cell_potential.toFixed(3)} V`,
                    formula: `E°cell = ${inputs.cathode_potential} V - ${inputs.anode_potential} V = ${cell_potential.toFixed(3)} V`
                };
            },
            
            "faraday-law": (inputs) => {
                const charge = inputs.current * inputs.time;
                const moles_electrons = charge / 96485;
                return {
                    result: `Q = ${charge.toFixed(0)} C, n(e⁻) = ${moles_electrons.toFixed(4)} mol`,
                    formula: `Q = ${inputs.current} A × ${inputs.time} s = ${charge.toFixed(0)} C`
                };
            },
            
            "nernst-equation": (inputs) => {
                const potential = inputs.standard_potential - (0.0592 / inputs.electrons) * Math.log10(inputs.reaction_quotient);
                return {
                    result: `E = ${potential.toFixed(3)} V`,
                    formula: `E = ${inputs.standard_potential} - (0.0592/${inputs.electrons}) × log(${inputs.reaction_quotient}) = ${potential.toFixed(3)} V`
                };
            },

            // Thermochemistry calculations
            "heat-capacity": (inputs) => {
                const heat = inputs.mass * inputs.specific_heat * inputs.temp_change;
                return {
                    result: `q = ${heat.toFixed(2)} J`,
                    formula: `q = ${inputs.mass} g × ${inputs.specific_heat} J/g°C × ${inputs.temp_change} °C = ${heat.toFixed(2)} J`
                };
            },
            
            "enthalpy-formation": (inputs) => {
                const enthalpy_reaction = inputs.products_enthalpy - inputs.reactants_enthalpy;
                return {
                    result: `ΔH°rxn = ${enthalpy_reaction.toFixed(2)} kJ/mol`,
                    formula: `ΔH°rxn = ${inputs.products_enthalpy} - ${inputs.reactants_enthalpy} = ${enthalpy_reaction.toFixed(2)} kJ/mol`
                };
            },
            
            "bond-energy": (inputs) => {
                const enthalpy_change = inputs.bonds_broken - inputs.bonds_formed;
                return {
                    result: `ΔH = ${enthalpy_change.toFixed(2)} kJ/mol`,
                    formula: `ΔH = ${inputs.bonds_broken} - ${inputs.bonds_formed} = ${enthalpy_change.toFixed(2)} kJ/mol`
                };
            },

            // Analytical Chemistry calculations
            "beer-lambert": (inputs) => {
                const absorbance = inputs.molar_absorptivity * inputs.concentration * inputs.path_length;
                return {
                    result: `A = ${absorbance.toFixed(3)}`,
                    formula: `A = ${inputs.molar_absorptivity} × ${inputs.concentration} × ${inputs.path_length} = ${absorbance.toFixed(3)}`
                };
            },
            
            "calibration-curve": (inputs) => {
                const y_value = inputs.slope * inputs.x_value + inputs.y_intercept;
                return {
                    result: `y = ${y_value.toFixed(3)}`,
                    formula: `y = ${inputs.slope} × ${inputs.x_value} + ${inputs.y_intercept} = ${y_value.toFixed(3)}`
                };
            },

            // Organic Chemistry calculations
            "molecular-formula": (inputs) => {
                const n = inputs.molecular_mass / inputs.empirical_mass;
                return {
                    result: `n = ${n.toFixed(0)}`,
                    formula: `n = ${inputs.molecular_mass} / ${inputs.empirical_mass} = ${n.toFixed(0)}`
                };
            },
            
            "percent-composition": (inputs) => {
                const percent = (inputs.element_mass / inputs.total_mass) * 100;
                return {
                    result: `${percent.toFixed(2)}%`,
                    formula: `% = (${inputs.element_mass} / ${inputs.total_mass}) × 100 = ${percent.toFixed(2)}%`
                };
            }
        };

        // Attach calculation methods to the data
        Object.values(this.calculationsData).forEach(categoryCalcs => {
            categoryCalcs.forEach(calc => {
                if (calculations[calc.id]) {
                    calc.calculate = calculations[calc.id];
                }
            });
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Category selection
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.currentCategory = item.dataset.category;
                this.updateHeader();
                this.renderCalculators();
            });
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderCalculators();
        });
    }

    // Setup lookup system
    setupLookupSystem() {
        const lookupInput = document.getElementById('lookupInput');
        const lookupResults = document.getElementById('lookupResults');

        lookupInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                lookupResults.style.display = 'none';
                return;
            }

            const results = this.lookupData.filter(item => 
                item.term.toLowerCase().includes(query) ||
                item.formula.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );

            if (results.length > 0) {
                lookupResults.innerHTML = results.map(item => `
                    <div class="lookup-result-item">
                        <div class="lookup-title">${item.term}</div>
                        <div class="lookup-formula">${item.formula}</div>
                    </div>
                `).join('');
                lookupResults.style.display = 'block';
            } else {
                lookupResults.style.display = 'none';
            }
        });

        // Hide lookup results when clicking outside
        document.addEventListener('click', (e) => {
            if (!lookupInput.contains(e.target) && !lookupResults.contains(e.target)) {
                lookupResults.style.display = 'none';
            }
        });
    }

    // Update header based on current category
    updateHeader() {
        const titles = {
            'all': 'All Calculations',
            'favorites': 'Favorite Calculations',
            'stoichiometry': 'Stoichiometry & Moles',
            'solutions': 'Solution Chemistry',
            'acids-bases': 'Acids & Bases',
            'redox': 'Redox & Electrochemistry',
            'thermochemistry': 'Thermochemistry',
            'analytical': 'Analytical Chemistry',
            'organic': 'Organic Chemistry'
        };

        const descriptions = {
            'all': 'Complete collection of chemistry calculations for high school students',
            'favorites': 'Your bookmarked calculations for quick access',
            'stoichiometry': 'Mole calculations, gas laws, and chemical equations',
            'solutions': 'Concentration, dilution, and solution preparation',
            'acids-bases': 'pH, pOH, and acid-base titration calculations',
            'redox': 'Oxidation-reduction reactions and electrochemistry',
            'thermochemistry': 'Heat, enthalpy, and energy calculations',
            'analytical': 'Spectroscopy and quantitative analysis',
            'organic': 'Molecular formulas and percent composition'
        };

        document.getElementById('categoryTitle').textContent = titles[this.currentCategory];
        document.getElementById('categoryDescription').textContent = descriptions[this.currentCategory];
    }

    // Get filtered calculations
    getFilteredCalculations() {
        let calculations = [];

        if (this.currentCategory === 'all') {
            Object.values(this.calculationsData).forEach(categoryCalcs => {
                calculations = calculations.concat(categoryCalcs);
            });
        } else if (this.currentCategory === 'favorites') {
            Object.values(this.calculationsData).forEach(categoryCalcs => {
                calculations = calculations.concat(categoryCalcs.filter(calc => 
                    this.favorites.includes(calc.id)
                ));
            });
        } else {
            calculations = this.calculationsData[this.currentCategory] || [];
        }

        // Apply search filter
        if (this.searchTerm) {
            calculations = calculations.filter(calc => 
                calc.title.toLowerCase().includes(this.searchTerm) ||
                calc.formula.toLowerCase().includes(this.searchTerm) ||
                (calc.description && calc.description.toLowerCase().includes(this.searchTerm))
            );
        }

        return calculations;
    }

    // Render calculators
    renderCalculators() {
        const grid = document.getElementById('calculatorsGrid');
        const noResults = document.getElementById('noResults');
        const calculations = this.getFilteredCalculations();

        if (calculations.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        grid.innerHTML = calculations.map(calc => this.createCalculatorCard(calc)).join('');
    }

    // Create calculator card HTML
    createCalculatorCard(calc) {
        const isFavorite = this.favorites.includes(calc.id);
        const inputs = calc.inputs.map(input => {
            if (input.type === 'text') {
                return `
                    <div class="input-group">
                        <label class="input-label">${input.label} ${input.unit ? `(${input.unit})` : ''}</label>
                        <input type="text" class="input-field" id="${calc.id}-${input.id}" placeholder="Enter ${input.label.toLowerCase()}">
                    </div>
                `;
            } else {
                return `
                    <div class="input-group">
                        <label class="input-label">${input.label} ${input.unit ? `(${input.unit})` : ''}</label>
                        <input type="number" class="input-field" id="${calc.id}-${input.id}" placeholder="Enter ${input.label.toLowerCase()}" step="any">
                    </div>
                `;
            }
        }).join('');

        return `
            <div class="calculator-card">
                <div class="calculator-header">
                    <h3 class="calculator-title">${calc.title}</h3>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="chemiApp.toggleFavorite('${calc.id}')">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
                
                <div class="formula-display">
                    ${calc.formula}
                </div>
                
                <div class="inputs-section">
                    ${inputs}
                </div>
                
                <button class="calculate-btn" onclick="chemiApp.performCalculation('${calc.id}')">
                    <i class="fas fa-calculator"></i> Calculate
                </button>
                
                <div class="result-section" id="result-${calc.id}" style="display: none;">
                    <div class="result-label">Result</div>
                    <div class="result-value" id="result-value-${calc.id}"></div>
                    <div class="formula-display" id="result-formula-${calc.id}"></div>
                </div>
            </div>
        `;
    }

    // Toggle favorite status
    toggleFavorite(calcId) {
        const index = this.favorites.indexOf(calcId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(calcId);
        }
        
        localStorage.setItem('chemi-favorites', JSON.stringify(this.favorites));
        this.updateCounts();
        this.renderCalculators();
    }

    // Perform calculation
    performCalculation(calcId) {
        // Find the calculation
        let calculation = null;
        Object.values(this.calculationsData).forEach(categoryCalcs => {
            const found = categoryCalcs.find(calc => calc.id === calcId);
            if (found) calculation = found;
        });

        if (!calculation || !calculation.calculate) {
            this.showError('Calculation method not found for this calculator.');
            return;
        }

        // Collect input values
        const inputs = {};
        let hasEmptyInputs = false;
        let hasInvalidInputs = false;

        calculation.inputs.forEach(input => {
            const element = document.getElementById(`${calcId}-${input.id}`);
            const value = element.value.trim();
            
            if (!value) {
                hasEmptyInputs = true;
                element.style.borderColor = 'var(--danger)';
                element.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
            } else {
                element.style.borderColor = 'var(--cool-grey-200)';
                element.style.backgroundColor = '';
                
                if (input.type === 'number') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        hasInvalidInputs = true;
                        element.style.borderColor = 'var(--danger)';
                        element.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                    } else {
                        inputs[input.id] = numValue;
                    }
                } else {
                    inputs[input.id] = value;
                }
            }
        });

        if (hasEmptyInputs) {
            this.showError('Please fill in all required fields.');
            return;
        }

        if (hasInvalidInputs) {
            this.showError('Please enter valid numerical values.');
            return;
        }

        // Perform calculation
        try {
            const result = calculation.calculate(inputs);
            
            // Display result
            const resultSection = document.getElementById(`result-${calcId}`);
            const resultValue = document.getElementById(`result-value-${calcId}`);
            const resultFormula = document.getElementById(`result-formula-${calcId}`);
            
            resultValue.textContent = result.result;
            resultFormula.textContent = result.formula;
            resultSection.style.display = 'block';
            
            // Smooth scroll to result
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Add success animation
            resultSection.style.animation = 'none';
            setTimeout(() => {
                resultSection.style.animation = 'fadeIn 0.5s ease-out';
            }, 10);
            
        } catch (error) {
            this.showError('Error in calculation. Please check your inputs and try again.');
            console.error('Calculation error:', error);
        }
    }

    // Clear all calculations
    clearAllCalculations() {
        // Clear all input fields
        document.querySelectorAll('.input-field').forEach(input => {
            input.value = '';
            input.style.borderColor = 'var(--cool-grey-200)';
            input.style.backgroundColor = '';
        });
        
        // Hide all result sections
        document.querySelectorAll('[id^="result-"]').forEach(result => {
            result.style.display = 'none';
        });

        // Show success message
        this.showSuccess('All calculations cleared successfully!');
    }

    // Update counts
    updateCounts() {
        const totalCount = Object.values(this.calculationsData).reduce((sum, cat) => sum + cat.length, 0);
        const allCountElement = document.getElementById('allCount');
        const favCountElement = document.getElementById('favCount');
        
        if (allCountElement) allCountElement.textContent = totalCount;
        if (favCountElement) favCountElement.textContent = this.favorites.length;
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Show success message
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            background: ${type === 'error' ? 'var(--danger)' : type === 'success' ? 'var(--success)' : 'var(--primary-dark)'};
        `;

        // Add to document
        document.body.appendChild(notification);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 4000);

        // Add click to dismiss
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
}

// Global functions for HTML onclick handlers
function clearAllCalculations() {
    if (window.chemiApp) {
        chemiApp.clearAllCalculations();
    }
}

// Add notification animations to CSS dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification {
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .notification:hover {
        transform: scale(1.02);
    }
`;
document.head.appendChild(notificationStyles);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chemiApp = new ChemiCalculator();
});

// Export for use in other files if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChemiCalculator;
}
