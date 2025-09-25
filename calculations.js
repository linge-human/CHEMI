// Calculation functions - all mathematical operations

// Generic calculation function using JSON definitions
function calculateFromJson(calcId, calcInstanceId) {
    log('Starting calculation for:', calcId, 'Instance:', calcInstanceId);

    const resultElement = document.getElementById(`${calcInstanceId}_result`);
    const showWorkingElement = document.getElementById(`${calcInstanceId}_showWorking`);
    const showWorking = showWorkingElement ? showWorkingElement.checked : false;

    try {
        // Find the calculator definition in the loaded data
        let calcDef = null;

        // Search through all categories for the calculator
        for (const category in calculationData) {
            const calc = calculationData[category].find(c => c.id === calcId);
            if (calc) {
                calcDef = calc;
                break;
            }
        }

        if (!calcDef) {
            console.error('Calculator definition not found for:', calcId);
            console.error('Available calculators:', Object.keys(calculationData).reduce((acc, cat) => {
                acc[cat] = calculationData[cat].map(c => c.id);
                return acc;
            }, {}));
            throw new Error(`Calculator definition not found for ${calcId}`);
        }

        log('Calculator definition found:', calcDef.title);
        log('Calculator type:', calcDef.calculation?.type);
        log('Calculator formula:', calcDef.calculation?.formula);

        // If calculator doesn't have new calculation structure, fall back to old system
        if (!calcDef.calculation) {
            console.log('Falling back to old calculation system for:', calcId);
            return calculateGeneric(calcId, calcInstanceId);
        }

        // Get input values with smart validation
        const inputs = {};
        const validationErrors = [];

        calcDef.inputs.forEach(input => {
            const inputElement = document.getElementById(`${calcInstanceId}_${input.id}`);
            if (!inputElement) {
                console.error('Input element not found:', `${calcInstanceId}_${input.id}`);
                validationErrors.push(`Input field ${input.label} not found`);
                return;
            }

            const rawValue = inputElement.value.trim();

            if (rawValue === '') {
                if (!input.optional) {
                    validationErrors.push(`${input.label} is required`);
                }
                return;
            }

            // Enhanced validation with our validation function
            try {
                let min = CONFIG.VALIDATION.MIN_NUMBER;
                let max = CONFIG.VALIDATION.MAX_NUMBER;

                // Apply specific validation rules
                if (input.id.includes('temperature') && input.unit === '°C') {
                    min = CONFIG.VALIDATION.MIN_TEMPERATURE_C;
                    max = CONFIG.VALIDATION.MAX_TEMPERATURE_C;
                } else if (input.id.includes('ph')) {
                    min = CONFIG.VALIDATION.MIN_PH;
                    max = CONFIG.VALIDATION.MAX_PH;
                } else if (input.id.includes('mass') || input.id.includes('volume') || input.id.includes('moles')) {
                    min = 0; // Can't have negative values
                }

                inputs[input.id] = validateNumericInput(rawValue, input.label, min, max);
            } catch (error) {
                validationErrors.push(error.message);
                return;
            }

            // Special check for zero values where they don't make sense
            if (inputs[input.id] === 0 && ['molar_mass', 'volume', 'temperature'].includes(input.id)) {
                validationErrors.push(`${input.label} cannot be zero`);
                return;
            }
        });

        if (validationErrors.length > 0) {
            const errorMessage = `Please fix the following: ${validationErrors.join(', ')}`;
            showError(`${calcInstanceId}_result`, errorMessage);
            return;
        }

        // Perform calculation based on the type
        let result;
        let working = '';

        switch (calcDef.calculation.type) {
            case 'basic_formula':
                if (!calcDef.calculation.formula) {
                    throw new Error('No formula defined for this calculator');
                }
                result = evaluateFormula(calcDef.calculation.formula, inputs);
                if (showWorking) {
                    working = generateWorkingSteps(calcDef.calculation.formula, inputs, result);
                }
                break;

            case 'solve_for_missing':
                // Handle ideal gas law type calculations
                const R = calcDef.calculation.R_constant || 0.08206;

                // Count provided values and find missing variable
                const variables = ['pressure', 'volume', 'moles', 'temperature'];
                const provided = {};
                const missing = [];

                variables.forEach(variable => {
                    if (inputs[variable] !== undefined) {
                        provided[variable] = inputs[variable];
                    } else {
                        missing.push(variable);
                    }
                });

                if (missing.length !== 1) {
                    throw new Error('Provide exactly 3 values to solve for the 4th');
                }

                const missingVar = missing[0];
                const labels = {
                    pressure: 'Pressure',
                    volume: 'Volume',
                    moles: 'Amount of substance',
                    temperature: 'Temperature'
                };
                const units = {
                    pressure: 'atm',
                    volume: 'L',
                    moles: 'mol',
                    temperature: 'K'
                };

                // Calculate missing value using PV = nRT
                if (missingVar === 'pressure') {
                    result = (provided.moles * R * provided.temperature) / provided.volume;
                } else if (missingVar === 'volume') {
                    result = (provided.moles * R * provided.temperature) / provided.pressure;
                } else if (missingVar === 'moles') {
                    result = (provided.pressure * provided.volume) / (R * provided.temperature);
                } else if (missingVar === 'temperature') {
                    result = (provided.pressure * provided.volume) / (provided.moles * R);
                }

                if (showWorking) {
                    const formula_parts = {
                        pressure: `P = nRT/V = (${provided.moles || 'n'} × ${R} × ${provided.temperature || 'T'}) / ${provided.volume || 'V'}`,
                        volume: `V = nRT/P = (${provided.moles || 'n'} × ${R} × ${provided.temperature || 'T'}) / ${provided.pressure || 'P'}`,
                        moles: `n = PV/RT = (${provided.pressure || 'P'} × ${provided.volume || 'V'}) / (${R} × ${provided.temperature || 'T'})`,
                        temperature: `T = PV/nR = (${provided.pressure || 'P'} × ${provided.volume || 'V'}) / (${provided.moles || 'n'} × ${R})`
                    };

                    working = `<div class="working">
                        <strong>Working:</strong><br>
                        PV = nRT → ${formula_parts[missingVar]}<br>
                        = ${Object.entries(provided).map(([k,v]) => v).join(' × ')} ${missingVar === 'moles' || missingVar === 'temperature' ? '÷' : '×'} ${R}<br>
                        = ${result.toFixed(4)} ${units[missingVar]}
                    </div>`;
                }

                // Display result
                resultElement.innerHTML = `
                    ${working}
                    <div class="result">
                        <strong>${labels[missingVar]}:</strong>
                        <span class="result-value">${result.toFixed(4)} ${units[missingVar]}</span>
                    </div>
                `;

                // Check if we're in practice mode and should validate the answer
                const calcCard = document.getElementById(calcInstanceId);
                if (calcCard && calcCard.classList.contains('practice-active') && calcCard.dataset.expectedResult) {
                    const resultValue = `${result.toFixed(4)} ${units[missingVar]}`;
                    checkPracticeAnswer(calcInstanceId, resultValue);
                }
                return;

            default:
                throw new Error('Unknown calculation type');
        }

        // Display result
        resultElement.innerHTML = `
            ${working}
            <div class="result">
                <strong>${calcDef.calculation.result_label}:</strong>
                <span class="result-value">${result.toFixed(4)} ${calcDef.calculation.result_unit}</span>
            </div>
        `;

        // Check if we're in practice mode and should validate the answer
        const calcCard = document.getElementById(calcInstanceId);
        if (calcCard && calcCard.classList.contains('practice-active') && calcCard.dataset.expectedResult) {
            const resultValue = `${result.toFixed(4)} ${calcDef.calculation.result_unit}`;
            checkPracticeAnswer(calcInstanceId, resultValue);
        }

    } catch (error) {
        resultElement.innerHTML = '<div class="error">Error in calculation</div>';
        console.error('Calculation error:', error);
    }
}

// Evaluate formula with values
function evaluateFormula(formula, values) {
    log('Evaluating formula:', formula);
    log('With values:', values);

    if (!formula || typeof formula !== 'string') {
        throw new Error('Formula is missing or invalid');
    }

    if (!values || typeof values !== 'object') {
        throw new Error('Input values are missing or invalid');
    }

    // Replace variable names with values
    let expression = formula;
    for (const [key, value] of Object.entries(values)) {
        if (value === undefined || value === null || isNaN(value)) {
            throw new Error(`Invalid value for ${key}: ${value}`);
        }
        // Use word boundary to avoid partial replacements
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
    }

    log('Generated expression:', expression);

    // Check if expression still contains unresolved variables
    const unresolvedVars = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
    if (unresolvedVars) {
        const mathFunctions = ['Math', 'pow', 'sqrt', 'log', 'exp', 'sin', 'cos', 'tan', 'abs'];
        const unresolved = unresolvedVars.filter(v => !mathFunctions.includes(v));
        if (unresolved.length > 0) {
            throw new Error(`Unresolved variables in formula: ${unresolved.join(', ')}`);
        }
    }

    // Safely evaluate the expression
    try {
        // Create a safe evaluation context
        const func = new Function('return ' + expression);
        const result = func();

        if (result === undefined || result === null || isNaN(result)) {
            throw new Error('Calculation produced an invalid result');
        }

        log('Calculation result:', result);
        return result;
    } catch (error) {
        console.error('Formula evaluation failed:', error);
        console.error('Original formula:', formula);
        console.error('Generated expression:', expression);
        console.error('Values:', values);
        throw new Error(`Invalid calculation formula: ${error.message}`);
    }
}

// Generate working steps
function generateWorkingSteps(formula, values, result) {
    const steps = [];

    // Step 1: Show the formula
    steps.push(`Formula: ${formula}`);

    // Step 2: Substitute values
    let substituted = formula;
    for (const [key, value] of Object.entries(values)) {
        substituted = substituted.replace(new RegExp(key, 'g'), value);
    }
    steps.push(`Substituting values: ${substituted}`);

    // Step 3: Show result
    steps.push(`Result: ${result}`);

    return `<div class="working"><strong>Working:</strong><br>${steps.join('<br>')}</div>`;
}

// Legacy calculation function for backwards compatibility
function calculateGeneric(calcType, calcId) {
    const resultElement = document.getElementById(`${calcId}_result`);
    const showWorking = document.getElementById(`${calcId}_show_working`)?.checked || false;

    try {
        let result;
        let working = '';

        switch (calcType) {
            case 'moles':
                const mass = parseFloat(document.getElementById(`${calcId}_mass`).value);
                const molarMass = parseFloat(document.getElementById(`${calcId}_molar_mass`).value);

                if (isNaN(mass) || isNaN(molarMass) || molarMass <= 0) {
                    throw new Error('Please enter valid positive numbers');
                }

                result = { value: `Amount of substance: ${(mass / molarMass).toFixed(3)} mol` };
                if (showWorking) {
                    result.working = `n = m / M = ${mass} g / ${molarMass} g/mol = ${(mass / molarMass).toFixed(3)} mol`;
                }
                break;

            case 'molarity':
                const moles = parseFloat(document.getElementById(`${calcId}_moles`).value);
                const volume = parseFloat(document.getElementById(`${calcId}_volume`).value);

                if (isNaN(moles) || isNaN(volume) || volume <= 0) {
                    throw new Error('Please enter valid positive numbers');
                }

                result = { value: `Molarity: ${(moles / volume).toFixed(3)} M` };
                if (showWorking) {
                    result.working = `M = n / V = ${moles} mol / ${volume} L = ${(moles / volume).toFixed(3)} M`;
                }
                break;

            case 'temperature':
                const temp = parseFloat(document.getElementById(`${calcId}_temperature`).value);
                const fromUnit = document.getElementById(`${calcId}_from_unit`).value;
                const toUnit = document.getElementById(`${calcId}_to_unit`).value;

                if (isNaN(temp)) {
                    throw new Error('Please enter a valid temperature');
                }

                const converted = convertTemperature(temp, fromUnit, toUnit);
                result = { value: converted.value, working: converted.working };
                break;

            default:
                result = { value: 'Calculator not implemented yet', working: '' };
        }

        if (result && result.value !== null && result.value !== undefined) {
            resultElement.innerHTML = result.value;
            if (showWorking && result.working) {
                resultElement.innerHTML += `<br><small class="working">${result.working}</small>`;
            }

            // Check if we're in practice mode and should validate the answer
            const calcCard = document.getElementById(calcId);
            if (calcCard && calcCard.classList.contains('practice-active') && calcCard.dataset.expectedResult) {
                checkPracticeAnswer(calcId, result.value);
            }
        } else {
            resultElement.textContent = 'Please enter valid values';
        }
    } catch (error) {
        resultElement.textContent = 'Error in calculation';
        console.error('Calculation error:', error);
    }
}

// Temperature conversion function
function convertTemperature(value, from, to) {
    let result;
    let working = '';

    if (from === to) {
        result = value;
        working = `${value} ${from === 'C' ? '°C' : from === 'F' ? '°F' : 'K'} = ${result} ${to === 'C' ? '°C' : to === 'F' ? '°F' : 'K'}`;
    } else if (from === 'C' && to === 'K') {
        result = value + 273.15;
        working = `${value} °C + 273.15 = ${result.toFixed(2)} K`;
    } else if (from === 'K' && to === 'C') {
        result = value - 273.15;
        working = `${value} K - 273.15 = ${result.toFixed(2)} °C`;
    } else if (from === 'C' && to === 'F') {
        result = (value * 9/5) + 32;
        working = `(${value} °C × 9/5) + 32 = ${result.toFixed(2)} °F`;
    } else if (from === 'F' && to === 'C') {
        result = (value - 32) * 5/9;
        working = `(${value} °F - 32) × 5/9 = ${result.toFixed(2)} °C`;
    } else if (from === 'F' && to === 'K') {
        result = ((value - 32) * 5/9) + 273.15;
        working = `((${value} °F - 32) × 5/9) + 273.15 = ${result.toFixed(2)} K`;
    } else if (from === 'K' && to === 'F') {
        result = ((value - 273.15) * 9/5) + 32;
        working = `((${value} K - 273.15) × 9/5) + 32 = ${result.toFixed(2)} °F`;
    }

    const units = to === 'C' ? '°C' : to === 'F' ? '°F' : 'K';
    return {
        value: `${result.toFixed(2)} ${units}`,
        working: working || `${value} ${from === 'C' ? '°C' : from === 'F' ? '°F' : 'K'} = ${result.toFixed(2)} ${units}`
    };
}

// Additional calculation functions for specific calculator types
function calculateMoles() {
    const mass = parseFloat(document.getElementById('mole-mass').value);
    const molarMass = parseFloat(document.getElementById('mole-molar-mass').value);
    const resultElement = document.getElementById('mole-result');

    if (isNaN(mass) || isNaN(molarMass) || mass < 0 || molarMass <= 0) {
        resultElement.textContent = 'Please enter valid positive numbers';
        return;
    }

    const moles = mass / molarMass;
    resultElement.textContent = `Amount of substance: ${moles.toFixed(4)} mol`;

    if (document.getElementById('show-working-moles')?.checked) {
        resultElement.innerHTML += `<br><small>Working: n = m / M = ${mass} g / ${molarMass} g/mol = ${moles.toFixed(4)} mol</small>`;
    }
}

function calculateMolarity() {
    const moles = parseFloat(document.getElementById('molarity-moles').value);
    const volume = parseFloat(document.getElementById('molarity-volume').value);
    const resultElement = document.getElementById('molarity-result');

    if (isNaN(moles) || isNaN(volume) || moles < 0 || volume <= 0) {
        resultElement.textContent = 'Please enter valid positive numbers (volume must be > 0)';
        return;
    }

    const molarity = moles / volume;
    resultElement.innerHTML = `Molarity: <span class="result-value">${molarity.toFixed(4)} M</span>`;

    if (document.getElementById('show-working-molarity')?.checked) {
        resultElement.innerHTML += `<br><small>Working: M = n / V = ${moles} mol / ${volume} L = ${molarity.toFixed(4)} M</small>`;
    }
}