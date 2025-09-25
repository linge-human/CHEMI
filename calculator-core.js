// Calculator core functionality - HTML generation, workspace management, basic calculations

// Add calculator by type
function addCalculatorByType(calcType, shouldCloseSidebar = true) {
    log('Adding calculator by type:', calcType);

    // First check if calculator of this type already exists
    const existingCalculator = findExistingCalculator(calcType);

    if (existingCalculator) {
        log('Calculator already exists:', calcType, 'Action:', existingCalculator.action);

        if (existingCalculator.action === 'scroll') {
            // Calculator is visible, scroll to it
            scrollToCalculator(existingCalculator.id);
            return;
        } else if (existingCalculator.action === 'restore') {
            // Calculator is minimized, restore it
            restoreCalculator(existingCalculator.id);
            return;
        }
    }

    // Calculator doesn't exist, create new one
    log('Creating new calculator:', calcType);

    // Find calculator definition
    let calcDef = null;
    for (const category in calculationData) {
        const calc = calculationData[category].find(c => c.id === calcType);
        if (calc) {
            calcDef = calc;
            break;
        }
    }

    if (!calcDef) {
        console.error('Calculator not found:', calcType);
        showError('workspace', `Calculator "${calcType}" not found`);
        return;
    }

    addCalculatorToWorkspace(calcDef, shouldCloseSidebar);
}

// Find existing calculator of the same type
function findExistingCalculator(calcType) {
    log('Searching for existing calculator of type:', calcType);

    // Check visible calculators in workspace
    const workspace = document.getElementById('workspace');
    const visibleCalculators = workspace.querySelectorAll(`.calc-card[data-calc-type="${calcType}"]`);

    for (const calc of visibleCalculators) {
        if (calc.style.display !== 'none') {
            log('Found visible calculator:', calc.id);
            return {
                id: calc.id,
                action: 'scroll',
                element: calc
            };
        }
    }

    // Check minimized calculators
    const minimizedButtons = document.getElementById('minimizedButtons');
    if (minimizedButtons) {
        const minimizedButton = minimizedButtons.querySelector(`[data-calc-type="${calcType}"]`);
        if (minimizedButton) {
            const calcId = minimizedButton.getAttribute('data-calc-id');
            log('Found minimized calculator:', calcId);
            return {
                id: calcId,
                action: 'restore',
                element: minimizedButton
            };
        }
    }

    log('No existing calculator found for type:', calcType);
    return null;
}

// Scroll to existing calculator with highlight effect
function scrollToCalculator(calcId) {
    const calculator = document.getElementById(calcId);
    if (!calculator) {
        log('Calculator not found for scrolling:', calcId);
        return;
    }

    log('Scrolling to calculator:', calcId);

    // Scroll to calculator
    calculator.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    // Add temporary highlight effect
    calculator.style.transition = 'box-shadow 0.3s ease';
    calculator.style.boxShadow = '0 0 20px rgba(0, 123, 255, 0.5)';

    setTimeout(() => {
        calculator.style.boxShadow = '';
        setTimeout(() => {
            calculator.style.transition = '';
        }, 300);
    }, 1500);
}

// Add calculator to workspace
function addCalculatorToWorkspace(calculation, autoClose = true) {
    // Check calculator limit
    if (calculatorCounter >= CONFIG.MAX_CALCULATORS) {
        showError('workspace', `Maximum of ${CONFIG.MAX_CALCULATORS} calculators reached. Please close some calculators first.`);
        return;
    }

    const workspace = document.getElementById('workspace');
    const emptyWorkspace = document.getElementById('emptyWorkspace');

    // Hide empty workspace message
    if (emptyWorkspace) emptyWorkspace.style.display = 'none';

    // Create unique ID for this calculator instance
    const calcId = `calc_${++calculatorCounter}`;

    // Create calculator card
    const calcCard = document.createElement('div');
    calcCard.className = 'calc-card';
    calcCard.id = calcId;
    calcCard.setAttribute('data-calc-type', calculation.id);
    calcCard.innerHTML = generateCalculatorHTML(calculation, calcId);

    workspace.appendChild(calcCard);

    // Save workspace state
    saveWorkspace();

    // Close sidebar on mobile after adding calculator
    if (autoClose && window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }

    // Scroll to the new calculator
    setTimeout(() => {
        calcCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// Generate HTML for a calculator based on its definition
function generateCalculatorHTML(calc, calcId) {
    const currentMode = localStorage.getItem(CONFIG.STORAGE_KEYS.MODE) || 'normal';
    log('Generating calculator for mode:', currentMode, 'Calculator:', calc.id);
    const isStudyMode = currentMode === 'study' || currentMode === 'practice';
    const isPracticeMode = currentMode === 'practice';
    log('Mode detection:', { currentMode, isStudyMode, isPracticeMode });
    log('Generating calculator:', calc.title, 'Mode:', currentMode, 'Has study_tips:', !!calc.study_tips);

    let inputsHTML = '';
    calc.inputs.forEach((input, index) => {
        inputsHTML += `
            <div class="input-group">
                <label for="${calcId}_${input.id}">${input.label}:</label>
                <input type="${input.type || 'number'}"
                       id="${calcId}_${input.id}"
                       placeholder="${input.placeholder || ''}"
                       step="any">
                <span class="input-unit">${input.unit}</span>
            </div>
        `;
    });

    // Generate badge HTML based on mode
    let badgeHTML = '';
    if (currentMode === 'study') {
        badgeHTML = '<span class="study-mode-badge">Study</span>';
    } else if (currentMode === 'practice') {
        badgeHTML = '<span class="practice-mode-badge">Practice</span>';
    }

    // Generate VCE unit tags
    let vceTagsHTML = '';
    if (calc.vce_units && calc.vce_units.length > 0) {
        vceTagsHTML = calc.vce_units.map(unit => {
            const unitNumber = unit.match(/Unit (\d)/)?.[1] || '';
            const areaOfStudy = unit.match(/Area of Study (\d)/)?.[1] || unit.split(':')[1]?.trim() || '';
            return `<span class="vce-tag">Unit ${unitNumber}: AoS ${areaOfStudy}</span>`;
        }).join('');
    }

    // Generate study tips HTML
    const keyPointsHTML = calc.study_tips?.key_points ?
        calc.study_tips.key_points.map(point => `<li>${point}</li>`).join('') : '';

    const errorsHTML = calc.study_tips?.common_errors ?
        calc.study_tips.common_errors.map(error => `<li>${error}</li>`).join('') : '';

    const vceConnectionsHTML = calc.study_tips?.vce_connections ?
        calc.study_tips.vce_connections.map(connection => `<li>${connection}</li>`).join('') : '';

    const extensionsHTML = calc.study_tips?.extensions ?
        calc.study_tips.extensions.map(ext => `<li>${ext}</li>`).join('') : '';

    const examplesHTML = calc.examples ?
        calc.examples.map(ex => `
            <div class="example-item">
                <strong>Problem:</strong> ${ex.problem}<br>
                <strong>Solution:</strong> ${ex.solution}<br>
                <strong>Answer:</strong> ${ex.answer}
            </div>
        `).join('') : '';

    return `
        <div class="calc-card" id="${calcId}" data-calc-type="${calc.id}">
            <div class="calc-header">
                <div class="calc-title-group">
                    <h3 class="calc-title">${calc.title}</h3>
                    ${badgeHTML}
                </div>
                <div class="calc-controls">
                    <button class="minimize-btn" onclick="minimizeCalculator('${calcId}')">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="close-btn" onclick="removeCalculator('${calcId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="calc-meta">
                ${vceTagsHTML}
                <div class="calc-formula">Formula: ${calc.formula}</div>
                <p class="calc-description">${calc.description}</p>
            </div>
            <div class="calc-content">
                <div class="calc-inputs-section">
                    ${inputsHTML}
                    <div class="show-working-label">
                        <input type="checkbox" id="${calcId}_showWorking" ${isStudyMode ? 'checked' : ''}>
                        <label for="${calcId}_showWorking">Show working</label>
                    </div>
                    <button class="calculate-btn" onclick="calculateFromJson('${calc.id}', '${calcId}')">
                        <i class="fas fa-calculator"></i> Calculate
                    </button>
                    <div class="result-display" id="${calcId}_result"></div>
                </div>
                <div class="study-tips-column" ${isStudyMode ? '' : 'style="display: none;"'}>
                    <h4>Study Guide</h4>
                    ${getStudyTipsContent(calc, calcId, isPracticeMode, keyPointsHTML, errorsHTML, examplesHTML, extensionsHTML, vceConnectionsHTML)}
                </div>
            </div>
        </div>
    `;
}

// Helper function to generate study tips content
function getStudyTipsContent(calc, calcId, isPracticeMode, keyPointsHTML, errorsHTML, examplesHTML, extensionsHTML, vceConnectionsHTML) {
    if (!isPracticeMode) {
        // Study mode content
        const hasStudyTips = calc.study_tips && (calc.study_tips.concept || keyPointsHTML || errorsHTML || examplesHTML || extensionsHTML || vceConnectionsHTML);

        if (hasStudyTips) {
            return `
                <div class="study-guide-grid">
                    <!-- Column 1: Concept, Key Points, Common Errors -->
                    <div class="study-guide-col">
                        ${calc.study_tips && calc.study_tips.concept ? `
                        <div class="study-tip-section">
                            <h5>💡 Concept</h5>
                            <p>${calc.study_tips.concept}</p>
                        </div>` : ''}
                        ${keyPointsHTML ? `
                        <div class="study-tip-section">
                            <h5>🎯 Key Points</h5>
                            <ul>${keyPointsHTML}</ul>
                        </div>` : ''}
                        ${errorsHTML ? `
                        <div class="study-tip-section">
                            <h5>⚠️ Common Errors</h5>
                            <ul>${errorsHTML}</ul>
                        </div>` : ''}
                    </div>

                    <!-- Column 2: Examples, Practice Mode Button -->
                    <div class="study-guide-col">
                        ${examplesHTML ? `
                        <div class="study-tip-section">
                            <h5>📝 Examples</h5>
                            ${examplesHTML}
                        </div>` : ''}
                        ${calc.interactive_questions ? `
                        <div class="study-tip-section">
                            <button class="practice-mode-switch-btn" onclick="switchToPracticeMode()">
                                <i class="fas fa-dumbbell"></i>
                                Switch to Practice Mode
                            </button>
                        </div>` : ''}
                    </div>

                    <!-- Column 3: Extensions, VCE Connections -->
                    <div class="study-guide-col">
                        ${extensionsHTML ? `
                        <div class="study-tip-section">
                            <h5>🚀 Extension Questions</h5>
                            <ul>${extensionsHTML}</ul>
                        </div>` : ''}
                        ${vceConnectionsHTML ? `
                        <div class="study-tip-section">
                            <h5>🎓 VCE Connections</h5>
                            <ul>${vceConnectionsHTML}</ul>
                        </div>` : ''}
                    </div>
                </div>`;
        } else if (calc.study_tips) {
            return `
                <!-- Fallback if no study tips but not in practice mode -->
                <div class="study-guide-grid">
                    <div class="study-guide-col">
                        <div class="study-tip-section">
                            <p style="color: var(--cool-grey-500); font-style: italic;">Study tips coming soon for this calculator!</p>
                        </div>
                    </div>
                </div>`;
        } else {
            return '';
        }
    } else {
        // Practice mode content
        return `
            <div class="study-guide-grid">
                <!-- Column 1: Question 1 -->
                <div class="study-guide-col">
                    ${calc.interactive_questions && calc.interactive_questions[0] ? `
                    <div class="interactive-question" data-calc-id="${calcId}" data-question-index="0">
                        <p class="question-text"><strong>Q1:</strong> ${calc.interactive_questions[0].question}</p>
                        ${calc.interactive_questions[0].hint ? `<p class="question-hint">💡 <em>${calc.interactive_questions[0].hint}</em></p>` : ''}
                        <button class="try-question-btn" onclick="loadQuestionInputs('${calcId}', 0)">
                            Try This Problem
                        </button>
                        <div class="question-result" style="display: none;">
                            <p class="follow-up-text"></p>
                        </div>
                    </div>` : ''}
                </div>

                <!-- Column 2: Question 2 -->
                <div class="study-guide-col">
                    ${calc.interactive_questions && calc.interactive_questions[1] ? `
                    <div class="interactive-question" data-calc-id="${calcId}" data-question-index="1">
                        <p class="question-text"><strong>Q2:</strong> ${calc.interactive_questions[1].question}</p>
                        ${calc.interactive_questions[1].hint ? `<p class="question-hint">💡 <em>${calc.interactive_questions[1].hint}</em></p>` : ''}
                        <button class="try-question-btn" onclick="loadQuestionInputs('${calcId}', 1)">
                            Try This Problem
                        </button>
                        <div class="question-result" style="display: none;">
                            <p class="follow-up-text"></p>
                        </div>
                    </div>` : ''}
                </div>

                <!-- Column 3: Switch back button -->
                <div class="study-guide-col">
                    <div class="study-tip-section">
                        <button class="practice-mode-switch-btn" onclick="switchToStudyMode()">
                            <i class="fas fa-book"></i>
                            Switch to Study Guide Mode
                        </button>
                    </div>
                </div>
            </div>`;
    }
}

// Minimize calculator
function minimizeCalculator(calcId) {
    const calcCard = document.getElementById(calcId);
    if (!calcCard) return;

    const minimizedButtons = document.getElementById('minimizedButtons');
    const calcTitle = calcCard.querySelector('.calc-title').textContent;

    // Hide the calculator
    calcCard.style.display = 'none';

    // Create minimized button
    const minBtn = document.createElement('button');
    minBtn.className = 'minimized-calc-btn';
    minBtn.setAttribute('data-calc-id', calcId);

    // Get calc-type from the original calculator card
    const calcType = calcCard.getAttribute('data-calc-type');
    if (calcType) {
        minBtn.setAttribute('data-calc-type', calcType);
    }

    minBtn.innerHTML = `<i class="fas fa-calculator"></i> ${calcTitle}`;
    minBtn.onclick = () => restoreCalculator(calcId);

    minimizedButtons.appendChild(minBtn);

    // Save workspace state
    saveWorkspace();
}

// Restore minimized calculator
function restoreCalculator(calcId) {
    const calcCard = document.getElementById(calcId);
    if (!calcCard) return;

    // Show the calculator
    calcCard.style.display = '';

    // Remove minimized button
    const minBtn = document.querySelector(`[data-calc-id="${calcId}"]`);
    if (minBtn) minBtn.remove();

    // Scroll to restored calculator
    calcCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Save workspace state
    saveWorkspace();
}

// Remove calculator from workspace
function removeCalculator(calcId) {
    const calcCard = document.getElementById(calcId);
    if (!calcCard) return;

    // Remove calculator with animation
    calcCard.style.opacity = '0';
    calcCard.style.transform = 'scale(0.9)';

    setTimeout(() => {
        calcCard.remove();

        // Also remove minimized button if exists
        const minBtn = document.querySelector(`[data-calc-id="${calcId}"]`);
        if (minBtn) minBtn.remove();

        // Save workspace state
        saveWorkspace();

        calculatorCounter--;

        // Check if workspace is empty
        const workspace = document.getElementById('workspace');
        if (workspace && workspace.children.length === 0) {
            const emptyWorkspace = document.getElementById('emptyWorkspace');
            if (emptyWorkspace) emptyWorkspace.style.display = 'block';
        }
    }, 300);
}

// Show copyright modal
function showCopyrightModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
        <div class="modal-content copyright-modal">
            <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
                <i class="fas fa-times"></i>
            </button>

            <h2>Copyright & Legal Information</h2>

            <div class="copyright-section">
                <h4>© 2025 Linge - All Rights Reserved</h4>
                <p>CHEMI - VCE Chemistry Calculator is proprietary software protected under copyright law.</p>
            </div>

            <div class="copyright-section">
                <h4>Terms of Use</h4>
                <ul>
                    <li>This application is for educational purposes only</li>
                    <li>All calculations should be verified independently</li>
                    <li>Not responsible for errors in calculations or academic outcomes</li>
                    <li>Commercial use is strictly prohibited without license</li>
                </ul>
            </div>

            <div class="copyright-section">
                <h4>Intellectual Property</h4>
                <p>All content, including but not limited to:</p>
                <ul>
                    <li>Calculator algorithms and implementations</li>
                    <li>Study guides and educational content</li>
                    <li>User interface design and layout</li>
                    <li>VCE Chemistry curriculum mappings</li>
                </ul>
                <p>are the exclusive property of Linge.</p>
            </div>

            <div class="copyright-section">
                <h4>Contact Information</h4>
                <p>For licensing inquiries or support, please contact: Linge</p>
                <p>Version: 1.0.0 (2025)</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add quick tool (simplified calculator)
function addQuickTool(toolType) {
    log('Adding quick tool:', toolType);

    // Convert tool types to calculator types
    let calcType = toolType;
    if (toolType === 'molar-mass') {
        calcType = 'molar-mass';
    } else if (toolType === 'temperature') {
        calcType = 'temperature-converter';
    } else if (toolType === 'ion-charge') {
        calcType = 'ion-charge';
    }

    // Use smart calculator management for all quick tools
    addCalculatorByType(calcType);
}

// Add molar mass calculator
function addMolarMassCalculator() {
    const calcId = `calc_${Date.now()}_${calculatorCounter++}`;
    const workspace = document.getElementById('workspace');

    const html = `
        <div class="calc-card" id="${calcId}" data-calc-type="molar-mass">
            <div class="calc-header">
                <h3 class="calc-title">Molar Mass Calculator</h3>
                <div class="calc-controls">
                    <button class="minimize-btn" onclick="minimizeCalculator('${calcId}')">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="close-btn" onclick="removeCalculator('${calcId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="calc-content">
                <div class="calc-inputs-section" style="flex: 1;">
                    <div class="input-group">
                        <label for="${calcId}_formula">Chemical Formula:</label>
                        <input type="text" id="${calcId}_formula" placeholder="e.g., H2O, Ca(OH)2, CuSO4.5H2O">
                    </div>
                    <button class="calculate-btn" onclick="calculateMolarMass('${calcId}')">
                        <i class="fas fa-calculator"></i> Calculate Molar Mass
                    </button>
                    <div class="result-display" id="${calcId}_result"></div>
                </div>
            </div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    workspace.appendChild(tempDiv.firstElementChild);

    // Save workspace
    saveWorkspace();
}

// Calculate molar mass from formula
function calculateMolarMass(calcId) {
    const formulaInput = document.getElementById(`${calcId}_formula`);
    const resultDiv = document.getElementById(`${calcId}_result`);

    try {
        const formula = validateChemicalFormula(formulaInput.value);
        const result = parseAndCalculateMolarMass(formula);

        resultDiv.innerHTML = `
            <div class="result-success">
                <strong>Molar Mass of ${formula}:</strong> ${result.toFixed(3)} g/mol
            </div>
        `;
    } catch (error) {
        showError(`${calcId}_result`, error.message);
    }
}

// Parse and calculate molar mass
function parseAndCalculateMolarMass(formula) {
    let totalMass = 0;
    let i = 0;

    while (i < formula.length) {
        // Check for opening parenthesis
        if (formula[i] === '(') {
            let j = i + 1;
            let depth = 1;

            // Find matching closing parenthesis
            while (j < formula.length && depth > 0) {
                if (formula[j] === '(') depth++;
                if (formula[j] === ')') depth--;
                j++;
            }

            // Extract the group inside parentheses
            const group = formula.substring(i + 1, j - 1);
            const groupMass = parseAndCalculateMolarMass(group);

            // Get the multiplier after the closing parenthesis
            let multiplier = '';
            while (j < formula.length && /\d/.test(formula[j])) {
                multiplier += formula[j];
                j++;
            }

            totalMass += groupMass * (multiplier ? parseInt(multiplier) : 1);
            i = j;

        } else if (/[A-Z]/.test(formula[i])) {
            // Extract element symbol
            let element = formula[i];
            i++;

            while (i < formula.length && /[a-z]/.test(formula[i])) {
                element += formula[i];
                i++;
            }

            // Extract count
            let count = '';
            while (i < formula.length && /\d/.test(formula[i])) {
                count += formula[i];
                i++;
            }

            const atomicMass = atomicMasses[element];
            if (!atomicMass) {
                throw new Error(`Unknown element: ${element}`);
            }

            totalMass += atomicMass * (count ? parseInt(count) : 1);

        } else if (formula[i] === '.') {
            // Handle hydrates (e.g., CuSO4.5H2O)
            i++;
            let coefficient = '';

            while (i < formula.length && /\d/.test(formula[i])) {
                coefficient += formula[i];
                i++;
            }

            const remainingFormula = formula.substring(i);
            const remainingMass = parseAndCalculateMolarMass(remainingFormula);

            totalMass += remainingMass * (coefficient ? parseInt(coefficient) : 1);
            break;

        } else {
            i++;
        }
    }

    return totalMass;
}