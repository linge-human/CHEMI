// Main initialization and coordination

// Initialize application and expose global functions
function initializeApp() {
    console.log('CHEMI Chemistry Calculator v1.0.0');
    console.log('Modules loaded successfully');

    // Expose legacy functions to global scope for onclick handlers
    if (typeof toggleUnit === 'function') window.toggleUnit = toggleUnit;
    if (typeof showCopyrightModal === 'function') window.showCopyrightModal = showCopyrightModal;
    if (typeof addCalculatorByType === 'function') window.addCalculatorByType = addCalculatorByType;
    if (typeof addQuickTool === 'function') window.addQuickTool = addQuickTool;
    if (typeof calculateFromJson === 'function') window.calculateFromJson = calculateFromJson;
    if (typeof calculateMolarMass === 'function') window.calculateMolarMass = calculateMolarMass;
    if (typeof minimizeCalculator === 'function') window.minimizeCalculator = minimizeCalculator;
    if (typeof removeCalculator === 'function') window.removeCalculator = removeCalculator;
    if (typeof restoreCalculator === 'function') window.restoreCalculator = restoreCalculator;
    if (typeof switchToPracticeMode === 'function') window.switchToPracticeMode = switchToPracticeMode;
    if (typeof switchToStudyMode === 'function') window.switchToStudyMode = switchToStudyMode;
    if (typeof loadQuestionInputs === 'function') window.loadQuestionInputs = loadQuestionInputs;
    if (typeof resetPracticeQuestion === 'function') window.resetPracticeQuestion = resetPracticeQuestion;
    if (typeof toggleSidebar === 'function') window.toggleSidebar = toggleSidebar;
    if (typeof clearAllCalculators === 'function') window.clearAllCalculators = clearAllCalculators;
    if (typeof checkEmptyWorkspace === 'function') window.checkEmptyWorkspace = checkEmptyWorkspace;
    if (typeof updateMinimizedBar === 'function') window.updateMinimizedBar = updateMinimizedBar;
    if (typeof getStudyTipsContent === 'function') window.getStudyTipsContent = getStudyTipsContent;
    if (typeof findCalculatorDefinition === 'function') window.findCalculatorDefinition = findCalculatorDefinition;
}

// Initialize data when page loads
document.addEventListener('DOMContentLoaded', loadData);

// Call initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);