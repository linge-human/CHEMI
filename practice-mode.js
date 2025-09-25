// Practice mode functionality

// Activate practice question mode (without auto-filling answers)
function loadQuestionInputs(calcId, questionIndex) {
    log('Activating practice question:', { calcId, questionIndex });

    try {
        // Find the calculator definition
        const calcCard = document.getElementById(calcId);
        if (!calcCard) {
            throw new Error('Calculator card not found');
        }

        const calcType = calcCard.getAttribute('data-calc-type');
        let calcDef = null;

        for (const category in calculationData) {
            const calc = calculationData[category].find(c => c.id === calcType);
            if (calc) {
                calcDef = calc;
                break;
            }
        }

        if (!calcDef) {
            throw new Error('Calculator definition not found');
        }

        if (!calcDef.interactive_questions || !calcDef.interactive_questions[questionIndex]) {
            throw new Error('Question not found');
        }

        const question = calcDef.interactive_questions[questionIndex];

        // Clear all inputs - don't auto-fill with answers!
        calcDef.inputs.forEach(input => {
            const inputElement = document.getElementById(`${calcId}_${input.id}`);
            if (inputElement) {
                inputElement.value = '';
            }
        });

        // Store the question data on the calculator element for later checking
        if (calcCard) {
            calcCard.dataset.expectedInputs = JSON.stringify(question.inputs);
            calcCard.dataset.expectedResult = question.expected_result;
            calcCard.dataset.followUp = question.follow_up;
        }

        // Update question button to show it's active
        const questionElement = document.querySelector(`[data-calc-id="${calcId}"][data-question-index="${questionIndex}"]`);
        if (questionElement) {
            const button = questionElement.querySelector('.try-question-btn');
            if (button) {
                button.textContent = 'Question Active';
                button.disabled = true;
                button.style.opacity = '0.6';
            }
        }

        // Add visual indicator to the active question
        document.querySelectorAll('.interactive-question').forEach(q => {
            q.classList.remove('active-question');
        });
        if (questionElement) {
            questionElement.classList.add('active-question');
        }

        // Add practice mode styling to calculator
        calcCard.classList.add('practice-active');

        // Disable other questions during active session
        document.querySelectorAll(`[data-calc-id="${calcId}"] .interactive-question`).forEach((q, idx) => {
            if (idx !== questionIndex) {
                q.classList.add('disabled');
                const btn = q.querySelector('.try-question-btn');
                if (btn) {
                    btn.disabled = true;
                }
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
        calcCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error('Error activating practice question:', error);
        showError(`${calcId}_result`, 'Failed to load practice question');
    }
}

// Check practice mode answers
function checkPracticeAnswer(calcInstanceId, calculatedResult) {
    const calcCard = document.getElementById(calcInstanceId);
    if (!calcCard) return;

    const expectedResult = parseFloat(calcCard.dataset.expectedResult);
    const followUp = calcCard.dataset.followUp;
    const resultElement = document.getElementById(`${calcInstanceId}_result`);

    // Extract numeric result from calculated result string
    const resultMatch = calculatedResult.match(/(\d+\.?\d*)/);
    const studentResult = resultMatch ? parseFloat(resultMatch[1]) : null;

    log('Practice mode check:', { studentResult, expectedResult, calculatedResult });

    if (studentResult && Math.abs(studentResult - expectedResult) < 0.01) {
        // Correct answer
        resultElement.innerHTML += `
            <div class="practice-feedback correct" style="margin-top: 10px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-left: 4px solid var(--success); color: var(--success);">
                <strong>✅ Correct!</strong> ${followUp}
            </div>
        `;

        // Add success styling
        calcCard.classList.add('correct-answer');
        setTimeout(() => calcCard.classList.remove('correct-answer'), 3000);

    } else {
        // Incorrect answer
        resultElement.innerHTML += `
            <div class="practice-feedback incorrect" style="margin-top: 10px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid var(--danger); color: var(--danger);">
                <strong>❌ Not quite right.</strong><br>
                Expected: ${expectedResult}<br>
                Your answer: ${studentResult || 'Invalid'}<br>
                <em>${followUp}</em>
            </div>
        `;

        // Add error styling
        calcCard.classList.add('incorrect-answer');
        setTimeout(() => calcCard.classList.remove('incorrect-answer'), 3000);
    }

    // Add option to try again
    resultElement.innerHTML += `
        <div style="margin-top: 10px;">
            <button class="reset-practice-btn" onclick="resetPracticeQuestion('${calcInstanceId}')"
                    style="background: var(--cool-grey-200); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                🔄 Try Another Question
            </button>
        </div>
    `;
}

// Reset practice question
function resetPracticeQuestion(calcInstanceId) {
    const calcCard = document.getElementById(calcInstanceId);
    if (!calcCard) return;

    // Remove practice mode styling
    calcCard.classList.remove('practice-active', 'correct-answer', 'incorrect-answer');

    // Clear data attributes
    delete calcCard.dataset.expectedResult;
    delete calcCard.dataset.expectedInputs;
    delete calcCard.dataset.followUp;

    // Reset calculate button
    const calculateBtn = calcCard.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.textContent = '🧮 Calculate';
        calculateBtn.style.background = '';
    }

    // Clear all inputs
    const inputs = calcCard.querySelectorAll('input[type="number"], input[type="text"]');
    inputs.forEach(input => {
        if (!input.type.includes('checkbox')) {
            input.value = '';
        }
    });

    // Clear result
    const resultElement = document.getElementById(`${calcInstanceId}_result`);
    if (resultElement) {
        resultElement.innerHTML = '';
    }

    // Reset all questions to active state
    document.querySelectorAll(`[data-calc-id="${calcInstanceId}"] .interactive-question`).forEach(q => {
        q.classList.remove('disabled', 'active-question');
        const btn = q.querySelector('.try-question-btn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Try This Problem';
            btn.style.opacity = '';
        }
    });

    // Remove practice indicator
    const indicator = calcCard.querySelector('.practice-mode-indicator');
    if (indicator) {
        indicator.remove();
    }
}