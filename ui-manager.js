// UI Management - sidebar, modes, mobile menu, etc.

// Initialize sidebar with calculation lists
function initializeSidebar() {
    // Initialize quick search
    initializeQuickSearch();

    // Add clear all button functionality
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllCalculators);
    }

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
    const savedUnitStates = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.UNIT_STATES) || '{"unit1": true}');

    Object.entries(savedUnitStates).forEach(([unitId, isExpanded]) => {
        if (isExpanded) {
            toggleUnit(unitId);
        }
    });
}

// Initialize mobile menu functionality
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

// Initialize mode toggle functionality
function initializeModeToggle() {
    const normalBtn = document.getElementById('normalMode');
    const studyBtn = document.getElementById('studyMode');
    const practiceBtn = document.getElementById('practiceMode');

    // Load saved preference
    const savedMode = localStorage.getItem(CONFIG.STORAGE_KEYS.MODE) || 'normal';
    setActiveMode(savedMode);

    // Add event listeners
    normalBtn.addEventListener('click', () => switchMode('normal'));
    studyBtn.addEventListener('click', () => switchMode('study'));
    practiceBtn.addEventListener('click', () => switchMode('practice'));
}

function switchMode(mode) {
    log('Switching mode to:', mode);

    // Update localStorage
    localStorage.setItem(CONFIG.STORAGE_KEYS.MODE, mode);

    // Update UI
    setActiveMode(mode);

    // Update all existing calculators
    log('Updating all calculators layout for mode:', mode);
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

// Update layout of all existing calculators when mode changes
function updateAllCalculatorsLayout(mode) {
    log('Updating all calculators layout for mode:', mode);

    const workspace = document.getElementById('workspace');
    const calcCards = workspace.querySelectorAll('.calc-card');
    log('Found calculator cards:', calcCards.length);

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
            // Normal mode: hide study tips
            if (studyTipsColumn) studyTipsColumn.style.display = 'none';
            if (showWorkingCheckbox) showWorkingCheckbox.checked = false;

        } else if (mode === 'study') {
            // Study mode: show study tips column and update content
            if (studyTipsColumn) {
                studyTipsColumn.style.display = '';
                updateStudyTipsContent(card, mode);
            }
            if (showWorkingCheckbox) showWorkingCheckbox.checked = true;

            // Add study mode badge
            if (titleGroup) {
                const badge = document.createElement('span');
                badge.className = 'study-mode-badge';
                badge.textContent = 'Study';
                titleGroup.insertBefore(badge, titleGroup.children[1]);
            }

        } else if (mode === 'practice') {
            // Practice mode: show study tips but only interactive questions
            if (studyTipsColumn) {
                studyTipsColumn.style.display = '';
                updateStudyTipsContent(card, mode);
            }
            if (showWorkingCheckbox) showWorkingCheckbox.checked = false;

            // Add practice mode badge
            if (titleGroup) {
                const badge = document.createElement('span');
                badge.className = 'practice-mode-badge';
                badge.textContent = 'Practice';
                titleGroup.insertBefore(badge, titleGroup.children[1]);
            }
        }

        // Save workspace state after mode change
        saveWorkspace();
    });
}

// Toggle unit expansion
function toggleUnit(unitId) {
    const unitSection = document.getElementById(unitId);
    if (!unitSection) return;

    const content = unitSection.querySelector('.unit-content');
    const chevron = unitSection.querySelector('.unit-chevron');

    unitSection.classList.toggle('expanded');

    if (unitSection.classList.contains('expanded')) {
        content.style.display = 'block';
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
    } else {
        content.style.display = 'none';
        chevron.classList.remove('fa-chevron-up');
        chevron.classList.add('fa-chevron-down');
    }

    // Save state
    saveUnitStates();
}

// Toggle all units (Show All / Hide All)
function toggleAllUnits() {
    const units = document.querySelectorAll('.unit-section');
    const toggleBtn = document.getElementById('toggleAllUnits');
    const isExpandingAll = toggleBtn.textContent === 'Show All';

    units.forEach(unit => {
        const unitId = unit.id;
        const content = unit.querySelector('.unit-content');
        const chevron = unit.querySelector('.unit-chevron');

        if (isExpandingAll) {
            // Expand all units
            unit.classList.add('expanded');
            content.style.display = 'block';
            chevron.classList.remove('fa-chevron-down');
            chevron.classList.add('fa-chevron-up');
        } else {
            // Collapse all units
            unit.classList.remove('expanded');
            content.style.display = 'none';
            chevron.classList.remove('fa-chevron-up');
            chevron.classList.add('fa-chevron-down');
        }
    });

    // Update button text
    toggleBtn.textContent = isExpandingAll ? 'Hide All' : 'Show All';

    // Save states
    saveUnitStates();
}

// Update sidebar based on current mode
function updateSidebarForMode() {
    const currentMode = localStorage.getItem(CONFIG.STORAGE_KEYS.MODE) || 'normal';
    // Mode-specific sidebar updates can go here if needed
}

// Toggle sidebar collapse
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');

    sidebar.classList.toggle('collapsed');

    // Update button icon
    const icon = collapseBtn.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
    }
}

// Clear all calculators from workspace
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
    calculatorCounter = 0;
    localStorage.removeItem(CONFIG.STORAGE_KEYS.WORKSPACE);
}

// Check if workspace is empty and show/hide empty message
function checkEmptyWorkspace() {
    const workspace = document.getElementById('workspace');
    const emptyWorkspace = document.getElementById('emptyWorkspace');

    if (workspace && emptyWorkspace) {
        const hasCalculators = workspace.querySelectorAll('.calc-card[style*="display: none"]').length < workspace.children.length;
        emptyWorkspace.style.display = hasCalculators ? 'none' : 'block';
    }
}

// Update minimized bar visibility
function updateMinimizedBar() {
    const minimizedButtons = document.getElementById('minimizedButtons');
    const minimizedBar = document.getElementById('minimizedBar');

    if (minimizedButtons && minimizedBar) {
        const hasMinimized = minimizedButtons.children.length > 0;
        minimizedBar.style.display = hasMinimized ? 'block' : 'none';
    }
}

// Switch to practice mode
function switchToPracticeMode() {
    log('Switching to practice mode');
    const practiceModeBtn = document.getElementById('practiceMode');
    log('Practice mode button found:', practiceModeBtn);
    if (practiceModeBtn) {
        log('Clicking practice mode button');
        practiceModeBtn.click();
    } else {
        console.error('Practice mode button not found!');
    }
}

// Switch to study mode
function switchToStudyMode() {
    const studyModeBtn = document.getElementById('studyMode');
    if (studyModeBtn) {
        studyModeBtn.click();
    }
}

// Update study tips content when mode changes
function updateStudyTipsContent(card, mode) {
    log('Updating study tips content for mode:', mode);

    const studyTipsColumn = card.querySelector('.study-tips-column');
    if (!studyTipsColumn) return;

    // Get calculator data from card attributes
    const calcType = card.getAttribute('data-calc-type');
    const calcId = card.id;

    if (!calcType) {
        log('No calc-type found for card:', calcId);
        return;
    }

    // Find calculator definition
    const calc = findCalculatorDefinition(calcType);
    if (!calc) {
        log('Calculator definition not found for type:', calcType);
        return;
    }

    log('Found calculator definition:', calc.title, 'for mode:', mode);

    // Generate content based on mode
    const isPracticeMode = mode === 'practice';

    // Generate the HTML content strings (same as in calculator-core.js)
    const keyPointsHTML = calc.study_tips && calc.study_tips.key_points ?
        calc.study_tips.key_points.map(point => `<li>${point}</li>`).join('') : '';

    const errorsHTML = calc.study_tips && calc.study_tips.common_errors ?
        calc.study_tips.common_errors.map(error => `<li>${error}</li>`).join('') : '';

    const vceConnectionsHTML = calc.study_tips && calc.study_tips.vce_connections ?
        calc.study_tips.vce_connections.map(connection => `<li>${connection}</li>`).join('') : '';

    const extensionsHTML = calc.study_tips && calc.study_tips.extensions ?
        calc.study_tips.extensions.map(ext => `<li>${ext}</li>`).join('') : '';

    const examplesHTML = calc.examples ?
        calc.examples.map(ex => `
            <div class="example">
                <p><strong>Example:</strong> ${ex.problem}</p>
                <p><em>Solution:</em> ${ex.solution}</p>
            </div>
        `).join('') : '';

    // Generate new content using the same function from calculator-core.js
    let newContent = '<h4>Study Guide</h4>';
    if (typeof getStudyTipsContent === 'function') {
        newContent += getStudyTipsContent(calc, calcId, isPracticeMode, keyPointsHTML, errorsHTML, examplesHTML, extensionsHTML, vceConnectionsHTML);
    } else {
        // Fallback if function not available
        log('getStudyTipsContent function not available, using fallback');
        if (isPracticeMode) {
            newContent += '<p>Practice mode content would go here</p>';
        } else {
            newContent += '<p>Study mode content would go here</p>';
        }
    }

    // Update the content
    studyTipsColumn.innerHTML = newContent;
    log('Updated study tips content for calculator:', calcId, 'mode:', mode);
}