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

                console.log(`Loaded calculator: ${calcInfo.id}`);
            } catch (calcError) {
                console.error(`Failed to load calculator ${calcInfo.id}:`, calcError);
            }
        });

        // Wait for all calculators to load
        await Promise.all(loadPromises);

        console.log('All calculator data loaded successfully:', calculationData);
        initializeSidebar();
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
        // Initialize with empty calculation data if loading fails
        calculationData = {};
    }
}

// Initialize data when page loads
document.addEventListener('DOMContentLoaded', loadData);

// Initialize sidebar with calculation lists
function initializeSidebar() {
    // Initialize quick search
    initializeQuickSearch();

    // Add clear all button functionality
    document.getElementById('clearAllBtn').addEventListener('click', clearAllCalculators);

    // Initialize mode toggle
    initializeModeToggle();

    // Initialize mobile menu
    initializeMobileMenu();

    // Initialize unit collapse functionality
    initializeUnitCollapse();

    // Load saved user preferences
    loadUserPreferences();

    // Apply initial mode filtering
    updateSidebarForMode();
}

// Initialize unit collapse/expand functionality
function initializeUnitCollapse() {
    // Load saved unit states, default to Unit 1 expanded
    const savedUnitStates = JSON.parse(localStorage.getItem('vce-unit-states') || '{"unit1": true}');

    Object.entries(savedUnitStates).forEach(([unitId, isExpanded]) => {
        if (isExpanded) {
            toggleUnit(unitId);
        }
    });
}

// Save current unit states to localStorage
function saveUnitStates() {
    const unitStates = {};
    document.querySelectorAll('.unit-section').forEach(unit => {
        unitStates[unit.id] = unit.classList.contains('expanded');
    });
    localStorage.setItem('vce-unit-states', JSON.stringify(unitStates));
}

// Load and restore all user preferences
function loadUserPreferences() {
    // Mode was already handled in initializeModeToggle
    // Unit states handled in initializeUnitCollapse
    // Restore pinned calculators and workspace
    restoreWorkspace();
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

    localStorage.setItem('vce-workspace', JSON.stringify(workspaceState));
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
    const savedWorkspace = localStorage.getItem('vce-workspace');
    if (!savedWorkspace) return;

    try {
        const workspaceState = JSON.parse(savedWorkspace);

        // Restore regular calculators
        workspaceState.calculators?.forEach(calcData => {
            // Add calculator without auto-close
            addCalculatorToWorkspace(findCalculatorDefinition(calcData.type), false);
        });

        // Restore minimized calculators
        workspaceState.minimizedCalculators?.forEach((calcData, index) => {
            const calcDef = findCalculatorDefinition(calcData.type);
            if (calcDef) {
                addCalculatorToWorkspace(calcDef, false);
                // Minimize it after adding with staggered timing
                setTimeout(() => {
                    const allCards = document.querySelectorAll(`[data-calc-type="${calcData.type}"]`);
                    const targetCard = allCards[allCards.length - 1]; // Get the most recently added one
                    if (targetCard && targetCard.style.display !== 'none') {
                        minimizeCalculator(targetCard.id);
                    }
                }, 100 + (index * 50)); // Stagger the minimizing operations
            }
        });
    } catch (error) {
        console.error('Error restoring workspace:', error);
    }
}

// Find calculator definition by type
function findCalculatorDefinition(calcType) {
    for (const category in calculationData) {
        const calc = calculationData[category].find(c => c.id === calcType);
        if (calc) return calc;
    }
    return null;
}

// Toggle individual unit visibility
function toggleUnit(unitId) {
    const unit = document.getElementById(unitId);
    const content = unit.querySelector('.unit-content');

    if (unit.classList.contains('expanded')) {
        // Collapse
        unit.classList.remove('expanded');
        content.style.display = 'none';
    } else {
        // Expand
        unit.classList.add('expanded');
        content.style.display = 'block';
    }

    // Save unit states after change
    saveUnitStates();
}

// Toggle all units (Show All / Hide All)
function toggleAllUnits() {
    const allUnits = document.querySelectorAll('.unit-section');
    const showAllText = document.getElementById('showAllText');
    const allExpanded = Array.from(allUnits).every(unit => unit.classList.contains('expanded'));

    if (allExpanded) {
        // Collapse all
        allUnits.forEach(unit => {
            unit.classList.remove('expanded');
            const content = unit.querySelector('.unit-content');
            if (content) content.style.display = 'none';
        });
        showAllText.textContent = 'Show All Calculators';
    } else {
        // Expand all
        allUnits.forEach(unit => {
            unit.classList.add('expanded');
            const content = unit.querySelector('.unit-content');
            if (content) content.style.display = 'block';
        });
        showAllText.textContent = 'Hide All Calculators';
    }
}

// Initialize mode toggle functionality
function initializeModeToggle() {
    const normalBtn = document.getElementById('normalMode');
    const studyBtn = document.getElementById('studyMode');
    const practiceBtn = document.getElementById('practiceMode');

    // Load saved preference
    const savedMode = localStorage.getItem('vce-mode') || 'normal';
    setActiveMode(savedMode);

    // Add event listeners
    normalBtn.addEventListener('click', () => switchMode('normal'));
    studyBtn.addEventListener('click', () => switchMode('study'));
    practiceBtn.addEventListener('click', () => switchMode('practice'));
}

function switchMode(mode) {
    console.log('🔄 Practice Mode - switchMode called with:', mode);

    // Update localStorage
    localStorage.setItem('vce-mode', mode);
    console.log('💾 Practice Mode - Mode saved to localStorage:', mode);

    // Update UI
    console.log('🎨 Practice Mode - Setting active mode UI:', mode);
    setActiveMode(mode);

    // Update all existing calculators
    console.log('🔄 Practice Mode - Updating all calculators layout for mode:', mode);
    updateAllCalculatorsLayout(mode);
}

function setActiveMode(mode) {
    // Remove active class from all buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));

    // Add active class to selected button
    const activeBtn = document.getElementById(mode === 'normal' ? 'normalMode' :
                                           mode === 'study' ? 'studyMode' : 'practiceMode');
    if (activeBtn) activeBtn.classList.add('active');
}

// Initialize mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function openMobileMenu() {
        sidebar.classList.add('mobile-open');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeMobileMenu() {
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Mobile menu button click
    mobileMenuBtn.addEventListener('click', openMobileMenu);

    // Overlay click to close
    mobileOverlay.addEventListener('click', closeMobileMenu);

    // Close mobile menu when calculator is added (optional UX improvement)
    const originalAddCalculator = window.addCalculatorByType;
    window.addCalculatorByType = function(calcType) {
        originalAddCalculator(calcType);
        if (window.innerWidth <= 1024) {
            closeMobileMenu();
        }
    };

    // Close mobile menu on window resize if it gets too large
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            closeMobileMenu();
        }
    });
}

// Update layout of all existing calculators when mode changes
function updateAllCalculatorsLayout(mode) {
    console.log('🔄 Practice Mode - updateAllCalculatorsLayout called with mode:', mode);

    const workspace = document.getElementById('workspace');
    const calcCards = workspace.querySelectorAll('.calc-card');
    console.log('📋 Practice Mode - Found calculator cards:', calcCards.length);

    calcCards.forEach(card => {
        const studyTipsColumn = card.querySelector('.study-tips-column');
        const studyModeBadge = card.querySelector('.study-mode-badge');
        const practiceModeBadge = card.querySelector('.practice-mode-badge');
        const showWorkingCheckbox = card.querySelector('.show-working-label input[type="checkbox"]');
        const titleGroup = card.querySelector('.calc-title-group');

        // Remove existing badges
        if (studyModeBadge) studyModeBadge.remove();
        if (practiceModeBadge) practiceModeBadge.remove();

        if (mode === 'normal') {
            // Normal mode: hide study tips, no badge
            if (studyTipsColumn) studyTipsColumn.style.display = 'none';
            if (showWorkingCheckbox) showWorkingCheckbox.checked = false;

        } else if (mode === 'study') {
            // Study Guide mode: show all study tips
            if (studyTipsColumn) studyTipsColumn.style.display = '';
            if (showWorkingCheckbox) showWorkingCheckbox.checked = true;

            // Add study mode badge
            if (titleGroup) {
                const badge = document.createElement('span');
                badge.className = 'study-mode-badge';
                badge.textContent = 'Study Guide';
                titleGroup.insertBefore(badge, titleGroup.children[1]);
            }

            // Show all study tip sections
            card.querySelectorAll('.study-tip-section').forEach(section => {
                section.style.display = '';
            });

        } else if (mode === 'practice') {
            // Practice mode: show study tips but only interactive questions
            if (studyTipsColumn) studyTipsColumn.style.display = '';
            if (showWorkingCheckbox) showWorkingCheckbox.checked = false;

            // Add practice mode badge
            if (titleGroup) {
                const badge = document.createElement('span');
                badge.className = 'practice-mode-badge';
                badge.textContent = 'Practice';
                titleGroup.insertBefore(badge, titleGroup.children[1]);
            }

            // Hide all study tip sections except interactive questions
            card.querySelectorAll('.study-tip-section').forEach(section => {
                const hasQuestions = section.querySelector('.interactive-question');
                section.style.display = hasQuestions ? '' : 'none';
            });
        }
    });
}

// Filter calculations based on Standard/Extended mode
function filterCalculationsByMode(isExtended) {
    // Define which calculations are available in standard mode
    const standardCalculations = {
        'stoichiometry': ['mass-moles', 'moles-mass', 'molarity', 'percent-yield'],
        'solutions': ['dilution', 'percent-ww'],
        'acids-bases': ['ph-calculation', 'h-concentration'],
        'thermochemistry': ['heat-capacity'],
        'analytical': [],
        'organic': ['percent-composition'],
        'redox': [],
        'toolkit': ['temperature-converter', 'molar-mass', 'ion-charge']
    };

    // Update calculation lists for each category
    Object.keys(calculationData).forEach(category => {
        const listElement = document.getElementById(category + 'List');
        if (!listElement || !calculationData[category]) return;

        listElement.innerHTML = '';
        let availableCalcs = calculationData[category];

        // Filter for standard mode
        if (!isExtended && standardCalculations[category]) {
            availableCalcs = calculationData[category].filter(calc =>
                standardCalculations[category].includes(calc.id)
            );
        }

        // Update calculation count
        const countElement = document.querySelector(`[data-category="${category}"] .calculation-count`);
        if (countElement) {
            countElement.textContent = availableCalcs.length;
        }

        // Populate filtered list
        availableCalcs.forEach(calc => {
            const calcItem = document.createElement('div');
            calcItem.className = 'calculation-item';
            calcItem.innerHTML = `
                <span class="calc-name">${calc.title}</span>
                <span class="calc-formula">${calc.formula}</span>
            `;
            calcItem.addEventListener('click', () => addCalculatorToWorkspace(calc));
            listElement.appendChild(calcItem);
        });
    });
}

// Toggle category expansion and show calculation list
function toggleCategory(category, element) {
    const listElement = document.getElementById(category + 'List');
    if (!listElement) return;

    // Toggle active state
    document.querySelectorAll('.category-item').forEach(item => {
        if (item !== element) {
            item.classList.remove('active');
            const otherList = document.getElementById(item.getAttribute('data-category') + 'List');
            if (otherList) otherList.style.display = 'none';
        }
    });

    element.classList.toggle('active');

    // Toggle list visibility
    if (listElement.style.display === 'block') {
        listElement.style.display = 'none';
    } else {
        listElement.style.display = 'block';
    }
}

// Populate calculation list for a category
function populateCalculationList(category) {
    const listElement = document.getElementById(category + 'List');
    if (!listElement || !calculationData[category]) return;

    listElement.innerHTML = '';

    calculationData[category].forEach(calc => {
        const calcItem = document.createElement('div');
        calcItem.className = 'calculation-item';
        calcItem.innerHTML = `
            <span class="calc-name">${calc.title}</span>
            <span class="calc-formula">${calc.formula}</span>
        `;
        calcItem.addEventListener('click', () => addCalculatorToWorkspace(calc));
        listElement.appendChild(calcItem);
    });
}

// Add calculator to workspace
function addCalculatorToWorkspace(calculation, autoClose = true) {
    const workspace = document.getElementById('workspace');
    const emptyWorkspace = document.getElementById('emptyWorkspace');

    // No auto-close functionality needed with minimize system

    // Hide empty workspace message
    emptyWorkspace.style.display = 'none';

    // Create unique ID for this calculator instance
    const calcId = `calc_${++calculatorCounter}`;

    // Create calculator card
    const calcCard = document.createElement('div');
    calcCard.className = 'calc-card';
    calcCard.id = calcId;
    calcCard.setAttribute('data-calc-type', calculation.id);
    calcCard.innerHTML = generateCalculatorHTML(calculation, calcId);

    workspace.appendChild(calcCard);

    // Save workspace state after adding
    if (autoClose) {
        saveWorkspace();
    }

    // Scroll to new calculator
    calcCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Function removed - no longer needed with minimize system

// Minimize a calculator to the top bar
function minimizeCalculator(calcId) {
    const calcCard = document.getElementById(calcId);
    const calcTitle = calcCard.querySelector('.calc-title').textContent;

    // Hide the calculator
    calcCard.style.display = 'none';

    // Create minimized button
    const minimizedButtons = document.getElementById('minimizedButtons');
    const minimizedBtn = document.createElement('button');
    minimizedBtn.className = 'minimized-calc-btn';
    minimizedBtn.setAttribute('data-calc-id', calcId);
    minimizedBtn.innerHTML = `
        <i class="fas fa-calculator"></i>
        <span>${calcTitle}</span>
    `;

    // Add click handler to restore
    minimizedBtn.onclick = () => restoreCalculator(calcId);

    minimizedButtons.appendChild(minimizedBtn);

    // Show minimized bar
    updateMinimizedBar();
    saveWorkspace();
}

// Restore a calculator from minimized state
function restoreCalculator(calcId) {
    const calcCard = document.getElementById(calcId);
    const minimizedBtn = document.querySelector(`[data-calc-id="${calcId}"]`);

    // Show the calculator
    calcCard.style.display = '';

    // Remove minimized button
    if (minimizedBtn) {
        minimizedBtn.remove();
    }

    // Update minimized bar visibility
    updateMinimizedBar();
    saveWorkspace();
}

// Remove calculator and save workspace state
function removeCalculator(closeBtn) {
    const calcCard = closeBtn.closest('.calc-card');
    // Remove any minimized button for this calculator
    const minimizedBtn = document.querySelector(`[data-calc-id="${calcCard.id}"]`);
    if (minimizedBtn) {
        minimizedBtn.remove();
    }

    calcCard.remove();
    checkEmptyWorkspace();
    updateMinimizedBar();
    saveWorkspace();
}

// Update minimized bar visibility
function updateMinimizedBar() {
    const minimizedCalculators = document.getElementById('minimizedCalculators');
    const minimizedButtons = document.getElementById('minimizedButtons');

    const count = minimizedButtons.children.length;

    if (count > 0) {
        minimizedCalculators.style.display = 'block';
    } else {
        minimizedCalculators.style.display = 'none';
    }

    checkEmptyWorkspace();
}

// Switch to practice mode
function switchToPracticeMode() {
    console.log('🔄 Practice Mode - switchToPracticeMode called');

    // Find and click the practice mode button
    const practiceModeBtn = document.getElementById('practiceMode');
    console.log('🔍 Practice Mode - Practice mode button found:', practiceModeBtn);

    if (practiceModeBtn) {
        console.log('✅ Practice Mode - Clicking practice mode button');
        practiceModeBtn.click();
    } else {
        console.error('❌ Practice Mode - Practice mode button not found!');
    }
}

// Switch to study mode
function switchToStudyMode() {
    console.log('🔄 Practice Mode - switchToStudyMode called');

    // Find and click the study mode button
    const studyModeBtn = document.getElementById('studyMode');
    console.log('🔍 Practice Mode - Study mode button found:', studyModeBtn);

    if (studyModeBtn) {
        console.log('✅ Practice Mode - Clicking study mode button');
        studyModeBtn.click();
    } else {
        console.error('❌ Practice Mode - Study mode button not found!');
    }
}

// Generate HTML for a calculator based on its definition
function generateCalculatorHTML(calc, calcId) {
    const currentMode = localStorage.getItem('vce-mode') || 'normal';
    console.log('🎯 Practice Mode - Generating calculator for mode:', currentMode, 'Calculator:', calc.id);
    const isStudyMode = currentMode === 'study' || currentMode === 'practice';
    const isPracticeMode = currentMode === 'practice';
    console.log('🎯 Practice Mode - Mode detection:', { currentMode, isStudyMode, isPracticeMode });
    console.log('Generating calculator:', calc.title, 'Mode:', currentMode, 'Has study_tips:', !!calc.study_tips);

    let inputsHTML = '';
    calc.inputs.forEach((input, index) => {
        inputsHTML += `
            <div class="input-group">
                <label for="${calcId}_${input.id}">${input.label}</label>
                <input type="${input.type}"
                       id="${calcId}_${input.id}"
                       placeholder="Enter ${input.label.toLowerCase()}"
                       class="input-field">
                <span class="input-unit">${input.unit}</span>
            </div>
        `;
    });

    // Always use horizontal layout, but conditionally show study tips
    {
        // Build study tips HTML from JSON structure (with fallbacks)
        let vceConnectionsHTML = '';
        if (calc.study_tips && calc.study_tips.vce_connections) {
            vceConnectionsHTML = calc.study_tips.vce_connections.map(conn => `<li>${conn}</li>`).join('');
        }

        let keyPointsHTML = '';
        if (calc.study_tips && calc.study_tips.key_points) {
            keyPointsHTML = calc.study_tips.key_points.map(point => `<li>${point}</li>`).join('');
        }

        let errorsHTML = '';
        if (calc.study_tips && calc.study_tips.common_errors) {
            errorsHTML = calc.study_tips.common_errors.map(error => `<li>${error}</li>`).join('');
        }

        let extensionsHTML = '';
        if (calc.study_tips && calc.study_tips.extensions) {
            extensionsHTML = calc.study_tips.extensions.map(ext => `<li>${ext}</li>`).join('');
        }

        let examplesHTML = '';
        if (calc.examples && calc.examples.length > 0) {
            examplesHTML = calc.examples.map(example => `
                <div class="example-box">
                    <p><strong>Problem:</strong> ${example.problem}</p>
                    <p><strong>Solution:</strong> ${example.solution}</p>
                    <p><strong>Answer:</strong> ${example.answer}</p>
                </div>
            `).join('');
        }

        // Always use horizontal layout, conditionally show study tips column
        return `
            <div class="calc-header">
                <div class="calc-title-group">
                    <span class="calc-title">${calc.title}</span>
                    ${isStudyMode ? '<span class="study-mode-badge">Study Guide</span>' : ''}
                    ${calc.vce_units ? `<span class="vce-units">${calc.vce_units.join(' • ')}</span>` : ''}
                </div>
                <div class="calc-header-actions">
                    <button class="minimize-btn" onclick="minimizeCalculator('${calcId}')" title="Minimize calculator">
                        <i class="fas fa-window-minimize"></i>
                    </button>
                    <button class="close-btn" onclick="removeCalculator(this)">×</button>
                </div>
            </div>
            <div class="calc-content-horizontal">
                <div class="calc-main-column">
                    <div class="calc-description">${calc.description}</div>
                    <div class="calc-formula">Formula: ${calc.formula}</div>
                    ${inputsHTML}
                    ${calc.id !== 'ion-charge' && calc.id !== 'molar-mass' && calc.id !== 'temperature-converter' ? `
                    <label class="show-working-label">
                        <input type="checkbox" id="${calcId}_show_working" ${isStudyMode ? 'checked' : ''}> Show working
                    </label>` : ''}
                    <button class="calc-button" onclick="calculateFromJson('${calc.id}', '${calcId}')">
                        ${calc.id === 'ion-charge' ? 'Look Up' :
                          calc.id === 'molar-mass' ? 'Calculate Mass' :
                          calc.id === 'temperature-converter' ? 'Convert' : 'Calculate'}
                    </button>
                    <div class="result-display" id="${calcId}_result"></div>
                </div>
                <div class="study-tips-column" ${isStudyMode ? '' : 'style="display: none;"'}>
                    <h4>Study Guide</h4>
${!isPracticeMode ? `
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
                                <h5>📈 Extensions</h5>
                                <ul>${extensionsHTML}</ul>
                            </div>` : ''}
                            ${vceConnectionsHTML ? `
                            <div class="study-tip-section">
                                <h5>🔗 VCE Connections</h5>
                                <ul>${vceConnectionsHTML}</ul>
                            </div>` : ''}
                        </div>

                        ${!calc.study_tips ? `
                        <div class="study-guide-col">
                            <div class="study-tip-section">
                                <p style="color: var(--cool-grey-500); font-style: italic;">Study tips coming soon for this calculator!</p>
                            </div>
                        </div>` : ''}
                    </div>` : `
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
                    </div>`}
                </div>
            </div>
        `;
    }
}

// Load interactive question inputs into calculator
function loadQuestionInputs(calcId, questionIndex) {
    console.log('🧪 Practice Mode - loadQuestionInputs called:', { calcId, questionIndex });

    // Find the calculator definition
    const calcCard = document.getElementById(calcId);
    if (!calcCard) {
        console.error('❌ Practice Mode - Calculator card not found:', calcId);
        return;
    }
    console.log('✅ Practice Mode - Calculator card found:', calcCard);

    const calcType = calcCard.getAttribute('data-calc-type');
    console.log('🔍 Practice Mode - Calculator type:', calcType);

    let calcDef = null;
    console.log('📋 Practice Mode - Available calculation data:', calculationData);

    for (const category in calculationData) {
        const calc = calculationData[category].find(c => c.id === calcType);
        if (calc) {
            calcDef = calc;
            console.log('✅ Practice Mode - Calculator definition found:', calcDef);
            break;
        }
    }

    if (!calcDef) {
        console.error('❌ Practice Mode - Calculator definition not found for type:', calcType);
        return;
    }

    if (!calcDef.interactive_questions) {
        console.error('❌ Practice Mode - No interactive questions found for calculator:', calcType);
        return;
    }

    if (!calcDef.interactive_questions[questionIndex]) {
        console.error('❌ Practice Mode - Question index not found:', questionIndex, 'Available questions:', calcDef.interactive_questions.length);
        return;
    }

    console.log('✅ Practice Mode - Question found:', calcDef.interactive_questions[questionIndex]);

    const question = calcDef.interactive_questions[questionIndex];

    // Clear all inputs first
    console.log('🧹 Practice Mode - Clearing all inputs for:', calcDef.inputs);
    calcDef.inputs.forEach(input => {
        const inputElement = document.getElementById(`${calcId}_${input.id}`);
        if (inputElement) {
            inputElement.value = '';
            console.log('✅ Practice Mode - Cleared input:', `${calcId}_${input.id}`);
        } else {
            console.warn('⚠️ Practice Mode - Input element not found:', `${calcId}_${input.id}`);
        }
    });

    // Load the question inputs
    console.log('📝 Practice Mode - Loading question inputs:', question.inputs);
    Object.entries(question.inputs).forEach(([inputId, value]) => {
        const inputElement = document.getElementById(`${calcId}_${inputId}`);
        if (inputElement) {
            inputElement.value = value;
            console.log('✅ Practice Mode - Set input:', `${calcId}_${inputId}`, 'to:', value);
        } else {
            console.warn('⚠️ Practice Mode - Input element not found for question:', `${calcId}_${inputId}`);
        }
    });

    // Update button text and add check functionality
    const questionElement = document.querySelector(`[data-calc-id="${calcId}"][data-question-index="${questionIndex}"]`);
    if (!questionElement) {
        console.error('❌ Practice Mode - Question element not found:', `[data-calc-id="${calcId}"][data-question-index="${questionIndex}"]`);
        return;
    }
    console.log('✅ Practice Mode - Question element found:', questionElement);

    const button = questionElement.querySelector('.try-question-btn');
    if (!button) {
        console.error('❌ Practice Mode - Try question button not found in:', questionElement);
        return;
    }
    console.log('✅ Practice Mode - Button found:', button);

    button.textContent = 'Check My Answer';
    button.onclick = () => checkQuestionAnswer(calcId, questionIndex);
    console.log('🔄 Practice Mode - Button updated to "Check My Answer"');

    // Add visual indicator to the active question
    calcCard.querySelectorAll('.interactive-question').forEach(q => q.classList.remove('active-question'));
    questionElement.classList.add('active-question');

    // Turn calculator green and add practice mode styling
    calcCard.classList.add('practice-active');

    // Grey out all other questions in this calculator
    const allQuestions = calcCard.querySelectorAll('.interactive-question');
    allQuestions.forEach(q => {
        const qIndex = parseInt(q.getAttribute('data-question-index'));
        if (qIndex !== questionIndex) {
            q.classList.add('disabled');
        } else {
            q.classList.remove('disabled');
        }
    });

    // Add practice mode indicator to calculator title
    const calcTitle = calcCard.querySelector('.calc-title-group');
    if (!calcTitle.querySelector('.practice-mode-indicator')) {
        const indicator = document.createElement('span');
        indicator.className = 'practice-mode-indicator';
        indicator.textContent = `Practice Q${questionIndex + 1}`;
        calcTitle.appendChild(indicator);
    } else {
        calcTitle.querySelector('.practice-mode-indicator').textContent = `Practice Q${questionIndex + 1}`;
    }

    // Scroll to calculator
    document.getElementById(calcId).scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Check if student's answer matches expected result
function checkQuestionAnswer(calcId, questionIndex) {
    console.log('🎯 Practice Mode - checkQuestionAnswer called:', { calcId, questionIndex });

    // Find the calculator definition
    const calcCard = document.getElementById(calcId);
    if (!calcCard) {
        console.error('❌ Practice Mode - Calculator card not found in checkAnswer:', calcId);
        return;
    }

    const calcType = calcCard.getAttribute('data-calc-type');
    console.log('🔍 Practice Mode - Calculator type in checkAnswer:', calcType);

    let calcDef = null;
    for (const category in calculationData) {
        const calc = calculationData[category].find(c => c.id === calcType);
        if (calc) {
            calcDef = calc;
            break;
        }
    }

    const question = calcDef.interactive_questions[questionIndex];
    console.log('📊 Practice Mode - Question to check:', question);

    const questionElement = document.querySelector(`[data-calc-id="${calcId}"][data-question-index="${questionIndex}"]`);
    if (!questionElement) {
        console.error('❌ Practice Mode - Question element not found for checking:', `[data-calc-id="${calcId}"][data-question-index="${questionIndex}"]`);
        return;
    }

    const resultDiv = questionElement.querySelector('.question-result');
    const followUpText = questionElement.querySelector('.follow-up-text');
    console.log('✅ Practice Mode - Result elements found:', { resultDiv, followUpText });

    // Trigger calculation
    console.log('🧮 Practice Mode - Triggering calculation for:', calcDef.id, calcId);
    calculateFromJson(calcDef.id, calcId);

    // Check result after a brief delay to allow calculation to complete
    console.log('⏳ Practice Mode - Waiting for calculation to complete...');
    setTimeout(() => {
        const resultElement = document.getElementById(`${calcId}_result`);
        if (!resultElement) {
            console.error('❌ Practice Mode - Result element not found:', `${calcId}_result`);
            return;
        }

        const resultText = resultElement.textContent;
        console.log('📊 Practice Mode - Result text:', resultText);

        // Extract numeric result (this is a simple approach)
        const match = resultText.match(/(\d+\.?\d*)/);
        const studentResult = match ? parseFloat(match[1]) : null;
        console.log('🔢 Practice Mode - Extracted student result:', studentResult);
        console.log('🎯 Practice Mode - Expected result:', question.expected_result);

        if (studentResult && Math.abs(studentResult - question.expected_result) < 0.1) {
            console.log('✅ Practice Mode - Answer is CORRECT!');
            followUpText.innerHTML = `✅ Correct! ${question.follow_up}`;
            followUpText.style.color = 'var(--success)';

            // Update button for next action
            const button = questionElement.querySelector('.try-question-btn');
            button.textContent = 'Try Another Question';
            button.onclick = () => resetQuestionState(calcId, questionIndex);

            // Trigger celebration animation
            triggerCelebration(calcId, questionIndex);

        } else {
            console.log('❌ Practice Mode - Answer is INCORRECT!');
            followUpText.innerHTML = `❌ Not quite right. Expected: ${question.expected_result}. ${question.follow_up}`;
            followUpText.style.color = 'var(--danger)';

            // Update button for retry
            const button = questionElement.querySelector('.try-question-btn');
            button.textContent = 'Try Again';
            button.onclick = () => loadQuestionInputs(calcId, questionIndex);
        }

        resultDiv.style.display = 'block';

        // Reset button
        const button = questionElement.querySelector('.try-question-btn');
        button.textContent = 'Try This Problem';
        button.onclick = () => loadQuestionInputs(calcId, questionIndex);
    }, 100);
}

// Trigger celebration animation for correct answers
function triggerCelebration(calcId, questionIndex) {
    const calcCard = document.getElementById(calcId);
    const questionElement = document.querySelector(`[data-calc-id="${calcId}"][data-question-index="${questionIndex}"]`);

    // Add celebration class to calculator
    calcCard.classList.add('celebration');

    // Create confetti effect
    createConfetti(questionElement);

    // Remove celebration class after animation
    setTimeout(() => {
        calcCard.classList.remove('celebration');
    }, 600);
}

// Create confetti animation
function createConfetti(element) {
    const colors = ['#10b981', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa'];
    const rect = element.getBoundingClientRect();

    for (let i = 0; i < 15; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * rect.width + 'px';
        confetti.style.top = Math.random() * 50 + 'px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.3 + 's';

        element.style.position = 'relative';
        element.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 1000);
    }
}

// Reset question state and enable all questions
function resetQuestionState(calcId, questionIndex) {
    const calcCard = document.getElementById(calcId);
    const questionElement = document.querySelector(`[data-calc-id="${calcId}"][data-question-index="${questionIndex}"]`);

    // Remove practice active styling from calculator
    calcCard.classList.remove('practice-active');

    // Re-enable all questions
    const allQuestions = calcCard.querySelectorAll('.interactive-question');
    allQuestions.forEach(q => {
        q.classList.remove('disabled', 'active-question');
    });

    // Reset button text and functionality
    const button = questionElement.querySelector('.try-question-btn');
    button.textContent = 'Try This Problem';
    button.onclick = () => loadQuestionInputs(calcId, questionIndex);

    // Clear follow-up text
    const followUpText = questionElement.querySelector('.follow-up-text');
    if (followUpText) {
        followUpText.innerHTML = '';
    }

    // Hide result div
    const resultDiv = questionElement.querySelector('.question-result');
    if (resultDiv) {
        resultDiv.style.display = 'none';
    }

    // Remove practice mode indicator
    const indicator = calcCard.querySelector('.practice-mode-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Check if workspace is empty and show message
function checkEmptyWorkspace() {
    const workspace = document.getElementById('workspace');
    const minimizedButtons = document.getElementById('minimizedButtons');
    const emptyWorkspace = document.getElementById('emptyWorkspace');

    // Count visible calculators in workspace
    const visibleCalculators = Array.from(workspace.querySelectorAll('.calc-card'))
        .filter(card => card.style.display !== 'none').length;

    // Count minimized calculators
    const minimizedCalculators = minimizedButtons.children.length;

    // Show empty workspace message only if no calculators at all
    if (visibleCalculators === 0 && minimizedCalculators === 0) {
        emptyWorkspace.style.display = 'block';
    } else {
        emptyWorkspace.style.display = 'none';
    }
}

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
    const workspace = document.getElementById('workspace');
    const minimizedButtons = document.getElementById('minimizedButtons');

    if (workspace) {
        workspace.innerHTML = '';
        checkEmptyWorkspace();
    }

    if (minimizedButtons) {
        minimizedButtons.innerHTML = '';
        updateMinimizedBar();
    }

    // Save cleared workspace state
    saveWorkspace();
}

// Generic calculation function that handles all calculator types
function calculateGeneric(calcType, calcId) {
    const resultElement = document.getElementById(`${calcId}_result`);
    const showWorking = document.getElementById(`${calcId}_show_working`).checked;

    try {
        let result, working;

        switch (calcType) {
            case 'mass-moles':
                result = calculateMassToMoles(calcId);
                break;
            case 'moles-mass':
                result = calculateMolesToMass(calcId);
                break;
            case 'molarity':
                result = calculateMolarityGeneric(calcId);
                break;
            case 'ideal-gas':
                result = calculateIdealGas(calcId);
                break;
            case 'heat-capacity':
                result = calculateHeatCapacity(calcId);
                break;
            case 'limiting-reagent':
                result = calculateLimitingReagent(calcId);
                break;
            case 'percent-yield':
                result = calculatePercentYieldGeneric(calcId);
                break;
            case 'dilution':
                result = calculateDilutionGeneric(calcId);
                break;
            case 'ph-calculation':
                result = calculatePHGeneric(calcId);
                break;
            case 'h-concentration':
                result = calculateHConcentration(calcId);
                break;
            case 'stp-volume':
                result = calculateSTPVolume(calcId);
                break;
            case 'empirical-formula':
                result = calculateEmpiricalFormula(calcId);
                break;
            case 'molecular-formula':
                result = calculateMolecularFormula(calcId);
                break;
            case 'percent-composition':
                result = calculatePercentComposition(calcId);
                break;
            case 'molar-mass':
                result = calculateMolarMassGeneric(calcId);
                break;
            case 'ion-charge':
                result = calculateIonChargeGeneric(calcId);
                break;
            case 'temperature-converter':
                result = calculateTemperatureGeneric(calcId);
                break;
            default:
                result = { value: 'Calculator not implemented yet', working: '' };
        }

        if (result && result.value !== null && result.value !== undefined) {
            resultElement.innerHTML = result.value;
            if (showWorking && result.working) {
                resultElement.innerHTML += `<br><small class="working">${result.working}</small>`;
            }
        } else {
            resultElement.textContent = 'Please enter valid values';
        }
    } catch (error) {
        resultElement.textContent = 'Error in calculation';
        console.error('Calculation error:', error);
    }
}

// Generic calculation function using JSON definitions
function calculateFromJson(calcId, calcInstanceId) {
    const resultElement = document.getElementById(`${calcInstanceId}_result`);
    const showWorking = document.getElementById(`${calcInstanceId}_show_working`).checked;


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
            throw new Error(`Calculator definition not found for ${calcId}`);
        }

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

            const value = parseFloat(rawValue);
            if (isNaN(value)) {
                validationErrors.push(`${input.label} must be a valid number`);
                return;
            }

            // Check for negative values where they don't make sense
            if (value < 0 && ['mass', 'volume', 'moles', 'concentration', 'temperature', 'pressure'].includes(input.id)) {
                validationErrors.push(`${input.label} cannot be negative`);
                return;
            }

            // Special validation for specific fields
            if (input.id === 'temperature' && value < 0 && input.unit === 'K') {
                validationErrors.push(`Temperature in Kelvin cannot be negative (absolute zero is 0 K)`);
                return;
            }

            if (input.id === 'ph' && (value < 0 || value > 14)) {
                validationErrors.push(`pH must be between 0 and 14`);
                return;
            }

            if (value === 0 && ['molar_mass', 'volume', 'temperature'].includes(input.id)) {
                validationErrors.push(`${input.label} cannot be zero`);
                return;
            }

            inputs[input.id] = value;
        });

        if (validationErrors.length > 0) {
            resultElement.innerHTML = `<div class="error">
                <strong>Please fix the following:</strong>
                <ul>${validationErrors.map(error => `<li>${error}</li>`).join('')}</ul>
            </div>`;
            return;
        }

        // Perform calculation based on the type
        let result;
        let working = '';

        if (calcDef.calculation.type === 'basic_formula') {
            // Use the formula from JSON to calculate result
            const formula = calcDef.calculation.formula;
            // Replace variable names in formula with actual values
            let evalFormula = formula;
            calcDef.inputs.forEach(input => {
                const regex = new RegExp('\\b' + input.id + '\\b', 'g');
                evalFormula = evalFormula.replace(regex, inputs[input.id]);
            });

            // Safely evaluate the formula
            try {
                result = Function('"use strict"; return (' + evalFormula + ')')();
            } catch (evalError) {
                console.error('Formula evaluation error:', evalError, 'Formula:', evalFormula);
                resultElement.innerHTML = '<div class="error">Calculation error. Please check your inputs and try again.</div>';
                return;
            }

            // Validate result
            if (!isFinite(result)) {
                resultElement.innerHTML = '<div class="error">Result is not a valid number. Please check your inputs.</div>';
                return;
            }

            if (result < 0 && ['mass', 'volume', 'moles', 'concentration'].includes(calcDef.calculation.result_label.toLowerCase())) {
                resultElement.innerHTML = '<div class="error">Result cannot be negative. Please check your inputs.</div>';
                return;
            }

            if (showWorking) {
                // Create a more robust working display
                let substitutedFormula = formula;
                calcDef.inputs.forEach(input => {
                    const regex = new RegExp('\\b' + input.id + '\\b', 'g');
                    substitutedFormula = substitutedFormula.replace(regex, inputs[input.id]);
                });

                working = `<div class="working">
                    <strong>Working:</strong><br>
                    ${calcDef.formula}<br>
                    = ${substitutedFormula}<br>
                    = ${result.toFixed(4)} ${calcDef.calculation.result_unit}
                </div>`;
            }
        } else if (calcDef.calculation.type === 'solve_for_missing') {
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
                resultElement.innerHTML = '<div class="error">Please provide exactly 3 values and leave 1 field empty to solve for.</div>';
                return;
            }

            const missingVar = missing[0];

            // Calculate the missing variable
            switch (missingVar) {
                case 'pressure':
                    result = (provided.moles * R * provided.temperature) / provided.volume;
                    break;
                case 'volume':
                    result = (provided.moles * R * provided.temperature) / provided.pressure;
                    break;
                case 'moles':
                    result = (provided.pressure * provided.volume) / (R * provided.temperature);
                    break;
                case 'temperature':
                    result = (provided.pressure * provided.volume) / (provided.moles * R);
                    break;
            }

            const units = {
                'pressure': 'atm',
                'volume': 'L',
                'moles': 'mol',
                'temperature': 'K'
            };

            const labels = {
                'pressure': 'Pressure',
                'volume': 'Volume',
                'moles': 'Moles',
                'temperature': 'Temperature'
            };

            if (showWorking) {
                const formula_parts = {
                    'pressure': 'P = nRT/V',
                    'volume': 'V = nRT/P',
                    'moles': 'n = PV/RT',
                    'temperature': 'T = PV/nR'
                };

                working = `<div class="working">
                    <strong>Working:</strong><br>
                    PV = nRT → ${formula_parts[missingVar]}<br>
                    = ${Object.entries(provided).map(([k,v]) => v).join(' × ')} ${missingVar === 'moles' || missingVar === 'temperature' ? '÷' : '×'} ${R}<br>
                    = ${result.toFixed(4)} ${units[missingVar]}
                </div>`;
            }

            // Display result with proper labeling
            resultElement.innerHTML = `
                ${working}
                <div class="result">
                    <strong>${labels[missingVar]}:</strong>
                    <span class="result-value">${result.toFixed(4)} ${units[missingVar]}</span>
                </div>
            `;
            return;
        }

        // Display result
        resultElement.innerHTML = `
            ${working}
            <div class="result">
                <strong>${calcDef.calculation.result_label}:</strong>
                <span class="result-value">${result.toFixed(4)} ${calcDef.calculation.result_unit}</span>
            </div>
        `;

    } catch (error) {
        resultElement.innerHTML = '<div class="error">Error in calculation</div>';
        console.error('Calculation error:', error);
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
        if (conc > 0 && conc <= 1) { // VCE typically deals with concentrations ≤ 1 M
            const pH = -Math.log10(conc);
            const pOH = 14 - pH;

            // VCE standard mode - only strong acids/bases
            const isStandardMode = localStorage.getItem('vce-mode') !== 'extended';

            let resultText = `pH = ${pH.toFixed(2)}, pOH = ${pOH.toFixed(2)}`;

            // Add acid/base classification for VCE
            if (pH < 7) {
                resultText += ` (Acidic)`;
            } else if (pH > 7) {
                resultText += ` (Basic)`;
            } else {
                resultText += ` (Neutral)`;
            }

            resultElement.textContent = resultText;

            // Show working
            if (document.getElementById('show-working-ph')?.checked) {
                let working = `pH = -log[H⁺] = -log(${conc.toExponential(2)}) = ${pH.toFixed(2)}<br>`;
                working += `pOH = 14 - pH = 14 - ${pH.toFixed(2)} = ${pOH.toFixed(2)}<br>`;
                working += `[OH⁻] = 10^(-pOH) = ${Math.pow(10, -pOH).toExponential(2)} M`;
                resultElement.innerHTML += `<br><small>${working}</small>`;
            }
        } else if (conc > 1) {
            resultElement.textContent = 'Concentration too high - VCE typically uses ≤ 1 M';
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

    if (!symbol) {
        resultElement.textContent = 'Please enter an ion symbol';
        return;
    }

    // Search through all possible ion formats
    let foundIon = null;
    let ionInfo = null;

    // Direct search
    if (ionData[symbol]) {
        foundIon = symbol;
        ionInfo = ionData[symbol];
    } else {
        // Search case-insensitive and with/without charges
        const searchTerms = [
            symbol.toUpperCase(),
            symbol.toLowerCase(),
            symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase(),
            symbol + '+',
            symbol + '-',
            symbol + '^+',
            symbol + '^-',
            symbol + '^2+',
            symbol + '^2-',
            symbol + '^3+',
            symbol + '^3-'
        ];

        for (const term of searchTerms) {
            if (ionData[term]) {
                foundIon = term;
                ionInfo = ionData[term];
                break;
            }
        }

        // If still not found, search by partial match
        if (!foundIon) {
            for (const [key, value] of Object.entries(ionData)) {
                if (key.toLowerCase().includes(symbol.toLowerCase()) ||
                    value.name.toLowerCase().includes(symbol.toLowerCase())) {
                    foundIon = key;
                    ionInfo = value;
                    break;
                }
            }
        }
    }

    if (foundIon && ionInfo) {
        resultElement.innerHTML = `${foundIon}: ${ionInfo.charge}<br><small>${ionInfo.name}</small>`;
    } else {
        resultElement.textContent = 'Ion not found in database. Try: NH4+, SO4^2-, Cl-, Ca2+';
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

    // VCE Common compounds lookup
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
        'KMNO4': 158.03,
        'NH4NO3': 80.04,
        'CA(OH)2': 74.09,
        'CAOH2': 74.09,
        'NH4CL': 53.49,
        'NH4OH': 35.05,
        'MGSO4': 120.37,
        'FE2O3': 159.69,
        'AL2O3': 101.96
    };

    if (commonCompounds[upperFormula]) {
        return commonCompounds[upperFormula];
    }

    // Handle parentheses and complex formulas
    return parseComplexFormula(formula);
}

// Enhanced formula parser that handles parentheses
function parseComplexFormula(formula) {
    let totalMass = 0;

    // First handle parentheses: Ca(OH)2 -> Ca + 2*O + 2*H
    formula = expandParentheses(formula);

    // Now parse simple element-count pairs
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

// Helper function to expand parentheses in formulas
function expandParentheses(formula) {
    // Handle patterns like Ca(OH)2 -> CaO2H2
    const parenRegex = /\(([^)]+)\)(\d*)/g;
    let expandedFormula = formula;

    expandedFormula = expandedFormula.replace(parenRegex, (match, group, multiplier) => {
        const mult = multiplier ? parseInt(multiplier) : 1;
        let expanded = '';

        // Parse the group inside parentheses
        const elementRegex = /([A-Z][a-z]?)(\d*)/g;
        let elementMatch;

        while ((elementMatch = elementRegex.exec(group)) !== null) {
            const element = elementMatch[1];
            const count = elementMatch[2] ? parseInt(elementMatch[2]) : 1;
            expanded += element + (count * mult);
        }

        return expanded;
    });

    return expandedFormula;
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

// VCE Essential Calculator Functions

// Mass to Moles calculation
function calculateMassToMoles(calcId) {
    const mass = parseFloat(document.getElementById(`${calcId}_mass`).value);
    const molarMass = parseFloat(document.getElementById(`${calcId}_molar_mass`).value);

    if (mass && molarMass && molarMass !== 0) {
        const moles = mass / molarMass;
        const working = `n = m/M = ${mass} g ÷ ${molarMass} g/mol = ${moles.toFixed(4)} mol`;
        return {
            value: `n = ${moles.toFixed(4)} mol`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// Moles to Mass calculation
function calculateMolesToMass(calcId) {
    const moles = parseFloat(document.getElementById(`${calcId}_moles`).value);
    const molarMass = parseFloat(document.getElementById(`${calcId}_molar_mass`).value);

    if (moles && molarMass) {
        const mass = moles * molarMass;
        const working = `m = n × M = ${moles} mol × ${molarMass} g/mol = ${mass.toFixed(2)} g`;
        return {
            value: `m = ${mass.toFixed(2)} g`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// Molarity calculation (generic version)
function calculateMolarityGeneric(calcId) {
    const moles = parseFloat(document.getElementById(`${calcId}_moles`).value);
    const volume = parseFloat(document.getElementById(`${calcId}_volume`).value);

    if (moles && volume && volume !== 0) {
        const molarity = moles / volume;
        const working = `c = n/V = ${moles} mol ÷ ${volume} L = ${molarity.toFixed(4)} mol/L`;
        return {
            value: `c = ${molarity.toFixed(4)} M`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// Heat Capacity calculation (q = mcΔT)
function calculateHeatCapacity(calcId) {
    const mass = parseFloat(document.getElementById(`${calcId}_mass`).value);
    const specificHeat = parseFloat(document.getElementById(`${calcId}_specific_heat`).value) || 4.18; // Default for water
    const tempChange = parseFloat(document.getElementById(`${calcId}_temp_change`).value);

    if (mass && tempChange) {
        const heat = mass * specificHeat * tempChange;
        const working = `q = mcΔT = ${mass} g × ${specificHeat} J/g°C × ${tempChange} °C = ${heat.toFixed(1)} J`;
        return {
            value: `q = ${heat.toFixed(1)} J = ${(heat/1000).toFixed(2)} kJ`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// Ideal Gas Law calculation
function calculateIdealGas(calcId) {
    const pressure = parseFloat(document.getElementById(`${calcId}_pressure`).value);
    const volume = parseFloat(document.getElementById(`${calcId}_volume`).value);
    const moles = parseFloat(document.getElementById(`${calcId}_moles`).value);
    const temperature = parseFloat(document.getElementById(`${calcId}_temperature`).value);
    const R = 0.08206; // L·atm/(mol·K)

    // Count how many variables are provided (should be 3, solving for the 4th)
    const values = [pressure, volume, moles, temperature];
    const providedCount = values.filter(v => !isNaN(v) && v !== null).length;

    if (providedCount !== 3) {
        return { value: 'Please provide exactly 3 values to solve for the 4th', working: '' };
    }

    let result, working;

    if (isNaN(pressure)) {
        // Solve for pressure: P = nRT/V
        const P = (moles * R * temperature) / volume;
        working = `P = nRT/V = (${moles} mol)(${R} L·atm/mol·K)(${temperature} K) ÷ ${volume} L = ${P.toFixed(3)} atm`;
        result = `P = ${P.toFixed(3)} atm`;
    } else if (isNaN(volume)) {
        // Solve for volume: V = nRT/P
        const V = (moles * R * temperature) / pressure;
        working = `V = nRT/P = (${moles} mol)(${R} L·atm/mol·K)(${temperature} K) ÷ ${pressure} atm = ${V.toFixed(3)} L`;
        result = `V = ${V.toFixed(3)} L`;
    } else if (isNaN(moles)) {
        // Solve for moles: n = PV/RT
        const n = (pressure * volume) / (R * temperature);
        working = `n = PV/RT = (${pressure} atm)(${volume} L) ÷ (${R} L·atm/mol·K)(${temperature} K) = ${n.toFixed(4)} mol`;
        result = `n = ${n.toFixed(4)} mol`;
    } else if (isNaN(temperature)) {
        // Solve for temperature: T = PV/nR
        const T = (pressure * volume) / (moles * R);
        working = `T = PV/nR = (${pressure} atm)(${volume} L) ÷ (${moles} mol)(${R} L·atm/mol·K) = ${T.toFixed(1)} K`;
        result = `T = ${T.toFixed(1)} K = ${(T - 273.15).toFixed(1)} °C`;
    }

    return { value: result, working: working };
}

// Limiting Reagent calculation
function calculateLimitingReagent(calcId) {
    const molesA = parseFloat(document.getElementById(`${calcId}_moles_a`).value);
    const coeffA = parseFloat(document.getElementById(`${calcId}_coeff_a`).value);
    const molesB = parseFloat(document.getElementById(`${calcId}_moles_b`).value);
    const coeffB = parseFloat(document.getElementById(`${calcId}_coeff_b`).value);

    if (molesA && coeffA && molesB && coeffB) {
        const ratioA = molesA / coeffA;
        const ratioB = molesB / coeffB;

        let limitingReagent, working;

        if (ratioA < ratioB) {
            limitingReagent = 'Reactant A';
            working = `Mole ratios: A = ${molesA}/${coeffA} = ${ratioA.toFixed(4)}; B = ${molesB}/${coeffB} = ${ratioB.toFixed(4)}`;
        } else if (ratioB < ratioA) {
            limitingReagent = 'Reactant B';
            working = `Mole ratios: A = ${molesA}/${coeffA} = ${ratioA.toFixed(4)}; B = ${molesB}/${coeffB} = ${ratioB.toFixed(4)}`;
        } else {
            limitingReagent = 'Neither (stoichiometric amounts)';
            working = `Mole ratios: A = ${molesA}/${coeffA} = ${ratioA.toFixed(4)}; B = ${molesB}/${coeffB} = ${ratioB.toFixed(4)}`;
        }

        return {
            value: `Limiting reagent: ${limitingReagent}`,
            working: working + `<br>The reactant with the smaller mole ratio is limiting.`
        };
    }
    return { value: null, working: '' };
}

// pH calculation (generic version)
function calculatePHGeneric(calcId) {
    const hConcentration = parseFloat(document.getElementById(`${calcId}_h_concentration`).value);

    if (hConcentration && hConcentration > 0) {
        const pH = -Math.log10(hConcentration);
        const pOH = 14 - pH;
        const working = `pH = -log[H⁺] = -log(${hConcentration.toExponential(2)}) = ${pH.toFixed(2)}<br>pOH = 14 - pH = 14 - ${pH.toFixed(2)} = ${pOH.toFixed(2)}`;
        return {
            value: `pH = ${pH.toFixed(2)}, pOH = ${pOH.toFixed(2)}`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// H+ concentration from pH
function calculateHConcentration(calcId) {
    const pH = parseFloat(document.getElementById(`${calcId}_ph`).value);

    if (pH >= 0 && pH <= 14) {
        const hConcentration = Math.pow(10, -pH);
        const working = `[H⁺] = 10^(-pH) = 10^(-${pH}) = ${hConcentration.toExponential(2)} M`;
        return {
            value: `[H⁺] = ${hConcentration.toExponential(2)} M`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// STP Volume calculation
function calculateSTPVolume(calcId) {
    const moles = parseFloat(document.getElementById(`${calcId}_moles`).value);

    if (moles) {
        const volume = moles * 22.4;
        const working = `V = n × 22.4 L/mol = ${moles} mol × 22.4 L/mol = ${volume.toFixed(2)} L`;
        return {
            value: `V = ${volume.toFixed(2)} L at STP`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// Percent Yield calculation (generic version)
function calculatePercentYieldGeneric(calcId) {
    const actual = parseFloat(document.getElementById(`${calcId}_actual`).value);
    const theoretical = parseFloat(document.getElementById(`${calcId}_theoretical`).value);

    if (actual && theoretical && theoretical !== 0) {
        const percentYield = (actual / theoretical) * 100;
        const working = `% Yield = (Actual yield ÷ Theoretical yield) × 100 = (${actual} ÷ ${theoretical}) × 100 = ${percentYield.toFixed(1)}%`;
        return {
            value: `${percentYield.toFixed(1)}%`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// Dilution calculation (generic version)
function calculateDilutionGeneric(calcId) {
    const c1 = parseFloat(document.getElementById(`${calcId}_c1`).value);
    const v1 = parseFloat(document.getElementById(`${calcId}_v1`).value);
    const c2 = parseFloat(document.getElementById(`${calcId}_c2`).value);

    if (c1 && v1 && c2 && c2 !== 0) {
        const v2 = (c1 * v1) / c2;
        const working = `C₁V₁ = C₂V₂<br>${c1} M × ${v1} mL = ${c2} M × V₂<br>V₂ = (${c1} × ${v1}) ÷ ${c2} = ${v2.toFixed(2)} mL`;
        return {
            value: `V₂ = ${v2.toFixed(2)} mL`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// Empirical Formula calculation
function calculateEmpiricalFormula(calcId) {
    const elementsInput = document.getElementById(`${calcId}_elements`).value;

    if (elementsInput) {
        // Simple implementation - would need more complex parsing for real use
        return {
            value: 'Feature coming soon - enter element ratios',
            working: 'Empirical formula calculation requires element mass analysis'
        };
    }
    return { value: null, working: '' };
}

// Molecular Formula calculation
function calculateMolecularFormula(calcId) {
    const empiricalMass = parseFloat(document.getElementById(`${calcId}_empirical_mass`).value);
    const molecularMass = parseFloat(document.getElementById(`${calcId}_molecular_mass`).value);

    if (empiricalMass && molecularMass && empiricalMass !== 0) {
        const multiplier = Math.round(molecularMass / empiricalMass);
        const working = `n = Molecular mass ÷ Empirical mass = ${molecularMass} ÷ ${empiricalMass} = ${multiplier}`;
        return {
            value: `Molecular formula = (Empirical formula) × ${multiplier}`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// Percent Composition calculation
function calculatePercentComposition(calcId) {
    const elementMass = parseFloat(document.getElementById(`${calcId}_element_mass`).value);
    const totalMass = parseFloat(document.getElementById(`${calcId}_total_mass`).value);

    if (elementMass && totalMass && totalMass !== 0) {
        const percentage = (elementMass / totalMass) * 100;
        const working = `% Element = (Mass of element ÷ Total mass) × 100 = (${elementMass} ÷ ${totalMass}) × 100 = ${percentage.toFixed(1)}%`;
        return {
            value: `${percentage.toFixed(1)}%`,
            working: working
        };
    }
    return { value: null, working: '' };
}

// Generic calculator functions for toolkit items

// Molar Mass calculator (generic version)
function calculateMolarMassGeneric(calcId) {
    const formula = document.getElementById(`${calcId}_formula`).value.trim();

    if (!formula) {
        return { value: 'Please enter a formula', working: '' };
    }

    try {
        const mass = parseMolecularFormula(formula);

        if (mass > 0) {
            const working = getFormulaBreakdown(expandParentheses(formula));
            return {
                value: `M = ${mass.toFixed(2)} g/mol`,
                working: working || `Formula: ${formula}`
            };
        } else {
            return { value: 'Unable to calculate - check formula', working: '' };
        }
    } catch (e) {
        return { value: 'Invalid formula format', working: '' };
    }
}

// Ion Charge calculator (generic version)
function calculateIonChargeGeneric(calcId) {
    const symbol = document.getElementById(`${calcId}_symbol`).value.trim();

    if (!symbol) {
        return { value: 'Please enter an ion symbol', working: '' };
    }

    // Collect all matching ions
    let foundIons = [];

    // Direct exact match
    if (ionData[symbol]) {
        foundIons.push({ key: symbol, info: ionData[symbol] });
    }

    // Try common variations
    const searchTerms = [
        symbol.toUpperCase(),
        symbol.toLowerCase(),
        symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase(),
        symbol + '+',
        symbol + '-',
        symbol + '2+',
        symbol + '2-',
        symbol + '3+',
        symbol + '3-'
    ];

    for (const term of searchTerms) {
        if (ionData[term] && !foundIons.find(i => i.key === term)) {
            foundIons.push({ key: term, info: ionData[term] });
        }
    }

    // Find all ions that match the base element (e.g., Fe -> Fe2+, Fe3+)
    const cleanSymbol = symbol.replace(/[0-9\+\-\^]/g, '');
    for (const [key, value] of Object.entries(ionData)) {
        const baseSymbol = key.replace(/[0-9\+\-\^]/g, '');
        if (baseSymbol.toLowerCase() === cleanSymbol.toLowerCase() && !foundIons.find(i => i.key === key)) {
            foundIons.push({ key, info: value });
        }
    }

    // If no results yet, search by name
    if (foundIons.length === 0) {
        for (const [key, value] of Object.entries(ionData)) {
            if (value.name.toLowerCase().includes(symbol.toLowerCase())) {
                foundIons.push({ key, info: value });
                if (foundIons.length >= 5) break; // Limit results
            }
        }
    }

    // Format results
    if (foundIons.length === 1) {
        return {
            value: `${foundIons[0].key}: ${foundIons[0].info.charge}`,
            working: `Name: ${foundIons[0].info.name}`
        };
    } else if (foundIons.length > 1) {
        const results = foundIons.slice(0, 5).map(ion =>
            `${ion.key}: ${ion.info.charge} (${ion.info.name})`
        ).join('<br>');
        return {
            value: `Found ${foundIons.length} matching ions:`,
            working: results
        };
    } else {
        // Helpful message for common elements
        const commonElements = ['Fe', 'Cu', 'Sn', 'Pb', 'Cr', 'Mn', 'Co', 'Ni', 'Au', 'Ag', 'Zn'];
        if (commonElements.some(el => el.toLowerCase() === cleanSymbol.toLowerCase())) {
            return {
                value: 'Element found - specify charge',
                working: `Try: ${cleanSymbol}2+ or ${cleanSymbol}3+ for specific ions`
            };
        }
        return {
            value: 'Ion not found',
            working: 'Examples: NH4+, SO42-, Fe2+, Ca2+'
        };
    }
}

// Temperature converter (generic version)
function calculateTemperatureGeneric(calcId) {
    const value = parseFloat(document.getElementById(`${calcId}_value`).value);
    const from = document.getElementById(`${calcId}_from`).value || 'C';
    const to = document.getElementById(`${calcId}_to`).value || 'K';

    if (isNaN(value)) {
        return { value: 'Please enter a temperature', working: '' };
    }

    let result;
    let celsius;
    let working = '';

    // Convert to Celsius first
    if (from === 'C') {
        celsius = value;
    } else if (from === 'K') {
        celsius = value - 273.15;
        working += `K to °C: ${value} - 273.15 = ${celsius.toFixed(2)}°C<br>`;
    } else if (from === 'F') {
        celsius = (value - 32) * 5/9;
        working += `°F to °C: (${value} - 32) × 5/9 = ${celsius.toFixed(2)}°C<br>`;
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

    const units = to === 'C' ? '°C' : to === 'F' ? '°F' : 'K';
    return {
        value: `${result.toFixed(2)} ${units}`,
        working: working || `${value} ${from === 'C' ? '°C' : from === 'F' ? '°F' : 'K'} = ${result.toFixed(2)} ${units}`
    };
}

// Help system
function showHelp(calcId) {
    const helpContent = getHelpContent(calcId);

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'help-modal';
    modal.innerHTML = `
        <div class="help-modal-content">
            <div class="help-header">
                <h3>${helpContent.title}</h3>
                <button class="close-help" onclick="this.closest('.help-modal').remove()">×</button>
            </div>
            <div class="help-body">
                <div class="help-section">
                    <h4>When to use:</h4>
                    <p>${helpContent.when}</p>
                </div>
                <div class="help-section">
                    <h4>Example:</h4>
                    <p>${helpContent.example}</p>
                </div>
                <div class="help-section">
                    <h4>VCE Context:</h4>
                    <p>${helpContent.vce}</p>
                </div>
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

function getHelpContent(calcId) {
    const helpData = {
        'mass-moles': {
            title: 'Mass to Moles Conversion',
            when: 'Use when you have the mass of a substance and need to find the number of moles. Essential for stoichiometry calculations.',
            example: 'Calculate moles in 36.0 g of H₂O: n = 36.0 g ÷ 18.0 g/mol = 2.0 mol',
            vce: 'Core Unit 1 calculation. Used in limiting reagent problems and percentage yield calculations.'
        },
        'moles-mass': {
            title: 'Moles to Mass Conversion',
            when: 'Use when you know the number of moles and need to find the mass of a substance.',
            example: 'Find mass of 0.5 mol NaCl: m = 0.5 mol × 58.44 g/mol = 29.22 g',
            vce: 'Essential for Unit 1 stoichiometry and Unit 3 solution preparation problems.'
        },
        'heat-capacity': {
            title: 'Heat Energy Calculation',
            when: 'Use to calculate heat energy transferred when temperature changes. Use 4.18 J/g°C for water unless specified.',
            example: 'Heat to warm 100 g water by 25°C: q = 100 g × 4.18 J/g°C × 25°C = 10,450 J',
            vce: 'Unit 2 thermochemistry. Often combined with moles for enthalpy calculations.'
        },
        'ideal-gas': {
            title: 'Ideal Gas Law',
            when: 'Use when dealing with gases under standard conditions. Leave one field blank to solve for that variable.',
            example: 'Find volume of 2 mol gas at 298 K and 1 atm: V = nRT/P = 2×0.08206×298/1 = 48.9 L',
            vce: 'Unit 1 calculations. Remember R = 0.08206 L·atm/(mol·K) or convert units appropriately.'
        },
        'limiting-reagent': {
            title: 'Limiting Reagent Determination',
            when: 'Use when you have two reactants and need to find which will be completely consumed first.',
            example: 'For reaction A + 2B → C, if you have 3 mol A and 4 mol B: A ratio = 3/1 = 3, B ratio = 4/2 = 2. B is limiting.',
            vce: 'Unit 1 stoichiometry. Essential for calculating theoretical yield in Unit 3.'
        },
        'ph-calculation': {
            title: 'pH from [H⁺] Concentration',
            when: 'Use for strong acids where [H⁺] equals the acid concentration. Not for weak acids in standard mode.',
            example: 'For 0.01 M HCl: pH = -log(0.01) = 2.0',
            vce: 'Unit 2 acids and bases. Standard mode covers strong acids/bases only.'
        }
    };

    return helpData[calcId] || {
        title: 'Calculator Help',
        when: 'This calculator helps with chemistry calculations.',
        example: 'Enter your values and click calculate.',
        vce: 'Part of the VCE Chemistry curriculum.'
    };
}

// New sidebar functionality

// Initialize quick search
function initializeQuickSearch() {
    const searchInput = document.getElementById('quickSearch');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const results = performSearch(query);
        displaySearchResults(results);
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            searchResults.style.display = 'none';
        }
    });
}

// Perform search across calculators, ions, and formulas
function performSearch(query) {
    const results = [];

    // Search calculators
    Object.values(calculationData).flat().forEach(calc => {
        if (calc.title.toLowerCase().includes(query) ||
            calc.description.toLowerCase().includes(query) ||
            calc.formula.toLowerCase().includes(query)) {
            results.push({
                type: 'calculator',
                title: calc.title,
                description: calc.description,
                data: calc
            });
        }
    });

    // Search ions
    Object.entries(ionData).forEach(([symbol, info]) => {
        if (symbol.toLowerCase().includes(query) ||
            info.name.toLowerCase().includes(query)) {
            results.push({
                type: 'ion',
                title: symbol,
                description: `${info.name} (${info.charge})`,
                data: { symbol, ...info }
            });
        }
    });

    // Search common formulas/constants
    const commonData = [
        { title: 'Avogadro\'s Number', description: '6.022 × 10²³ particles/mol', type: 'constant' },
        { title: 'Gas Constant R', description: '0.08206 L·atm/(mol·K)', type: 'constant' },
        { title: 'Water Specific Heat', description: '4.18 J/(g·°C)', type: 'constant' },
        { title: 'Molar Volume STP', description: '22.4 L/mol at STP', type: 'constant' }
    ];

    commonData.forEach(item => {
        if (item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)) {
            results.push(item);
        }
    });

    return results.slice(0, 8); // Limit results
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');

    if (results.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    searchResults.innerHTML = results.map(result => `
        <div class="search-result-item" onclick="handleSearchResult('${result.type}', ${JSON.stringify(result).replace(/"/g, '&quot;')})">
            <div class="search-result-title">${result.title}</div>
            <div class="search-result-description">${result.description}</div>
        </div>
    `).join('');

    searchResults.style.display = 'block';
}

// Handle search result selection
function handleSearchResult(type, resultData) {
    const result = typeof resultData === 'string' ? JSON.parse(resultData) : resultData;

    if (type === 'calculator') {
        addCalculatorToWorkspace(result.data);
    } else if (type === 'ion') {
        addQuickTool('ion-charge');
        // Pre-fill the ion search after a short delay
        setTimeout(() => {
            const ionInputs = document.querySelectorAll('[id$="_symbol"]');
            const latestInput = ionInputs[ionInputs.length - 1];
            if (latestInput) {
                latestInput.value = result.data.symbol;
                latestInput.focus();
            }
        }, 100);
    }

    // Hide search results
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('quickSearch').value = '';
}

// Quick tool functions
function addQuickTool(toolType) {
    const toolConfigs = {
        'molar-mass': {
            id: 'molar-mass',
            title: 'Molar Mass Calculator',
            formula: 'M = Σ(atomic masses)',
            description: 'Calculate molar mass from molecular formula',
            inputs: [{id: 'formula', label: 'Chemical Formula', unit: '', type: 'text'}]
        },
        'ion-charge': {
            id: 'ion-charge',
            title: 'Ion Charge Lookup',
            formula: 'Database lookup',
            description: 'Find charge and name of ions',
            inputs: [{id: 'symbol', label: 'Ion Symbol', unit: '', type: 'text'}]
        },
        'temperature': {
            id: 'temperature-converter',
            title: 'Temperature Converter',
            formula: 'K = °C + 273.15',
            description: 'Convert between temperature scales',
            inputs: [
                {id: 'value', label: 'Temperature Value', unit: '', type: 'number'},
                {id: 'from', label: 'From Scale', unit: '', type: 'select'},
                {id: 'to', label: 'To Scale', unit: '', type: 'select'}
            ]
        }
    };

    if (toolConfigs[toolType]) {
        addCalculatorToWorkspace(toolConfigs[toolType]);
    }
}

// Add calculator by type
function addCalculatorByType(calcType) {
    // Find the calculator in our data
    let calculator = null;

    Object.values(calculationData).forEach(category => {
        const found = category.find(calc => calc.id === calcType);
        if (found) calculator = found;
    });

    if (calculator) {
        addCalculatorToWorkspace(calculator);
    }
}

// Update sidebar based on current mode
function updateSidebarForMode() {
    const isExtended = localStorage.getItem('vce-mode') === 'extended';
    const advancedGroup = document.querySelector('.advanced-group');

    if (advancedGroup) {
        if (isExtended) {
            advancedGroup.classList.remove('hidden');
        } else {
            advancedGroup.classList.add('hidden');
        }
    }
}

// Show all calculators modal
function showAllCalculators() {
    const modal = document.createElement('div');
    modal.className = 'help-modal';

    const isExtended = localStorage.getItem('vce-mode') === 'extended';
    let calculatorsList = '';

    Object.entries(calculationData).forEach(([category, calculators]) => {
        calculatorsList += `<div class="calc-category">
            <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
            <div class="calc-grid">`;

        calculators.forEach(calc => {
            calculatorsList += `
                <button class="modal-calc-btn" onclick="addCalculatorToWorkspace(${JSON.stringify(calc).replace(/"/g, '&quot;')}); this.closest('.help-modal').remove();">
                    ${calc.title}
                </button>`;
        });

        calculatorsList += '</div></div>';
    });

    modal.innerHTML = `
        <div class="help-modal-content">
            <div class="help-header">
                <h3>All Calculators</h3>
                <button class="close-help" onclick="this.closest('.help-modal').remove()">×</button>
            </div>
            <div class="help-body">
                ${calculatorsList}
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

// Enhanced sticky header scroll detection
document.addEventListener('DOMContentLoaded', function() {
    const workspaceHeader = document.querySelector('.workspace-header');
    let lastScrollY = window.scrollY;

    if (workspaceHeader) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Add/remove scrolled class based on scroll position
            if (currentScrollY > 10) {
                workspaceHeader.classList.add('scrolled');
            } else {
                workspaceHeader.classList.remove('scrolled');
            }

            lastScrollY = currentScrollY;
        });
    }
});

// Show copyright modal
function showCopyrightModal() {
    const modal = document.createElement('div');
    modal.className = 'copyright-modal';

    modal.innerHTML = `
        <div class="copyright-modal-content">
            <div class="copyright-header">
                <h3>Copyright Information</h3>
                <button class="close-help" onclick="this.closest('.copyright-modal').remove()">×</button>
            </div>
            <div class="copyright-body">
                <div class="copyright-section">
                    <h4>Copyright Notice</h4>
                    <p>© 2025 Linge. All rights reserved.</p>
                    <p>CHEMI is a proprietary educational software application designed to assist VCE Chemistry students with calculations and study materials.</p>
                </div>

                <div class="copyright-section">
                    <h4>Software License</h4>
                    <p>This software is protected by copyright law and international treaties. Unauthorized reproduction or distribution of this software, or any portion of it, may result in severe civil and criminal penalties.</p>
                </div>

                <div class="copyright-section">
                    <h4>Educational Use</h4>
                    <p>This application is intended for educational purposes to support VCE Chemistry studies. The calculations and study materials are designed to align with the Victorian Certificate of Education Chemistry curriculum.</p>
                </div>

                <div class="copyright-section">
                    <h4>Third-Party Libraries</h4>
                    <p>This application uses the following third-party libraries:</p>
                    <ul>
                        <li>Font Awesome Icons - Licensed under Font Awesome Free License</li>
                        <li>Inter Font Family - Licensed under SIL Open Font License</li>
                    </ul>
                </div>

                <div class="copyright-section">
                    <h4>Contact Information</h4>
                    <p>For licensing inquiries or support, please contact: Linge</p>
                    <p>Version: 1.0.0 (2025)</p>
                </div>
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
