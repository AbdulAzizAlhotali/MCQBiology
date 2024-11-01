// quiz.js
let gameState = {
    selectedUnits: [],
    currentQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    totalPossibleScore: 0,
    mistakes: []    
};

document.addEventListener('DOMContentLoaded', initializeInterface);

function initializeInterface() {
    const unitsGrid = document.getElementById('unitsGrid');
    unitsGrid.innerHTML = quizData.units.map(unit => `
        <div class="unit-card" onclick="toggleUnit(${unit.id})" data-unit-id="${unit.id}">
            <div class="unit-title">الوحدة ${unit.id}: ${unit.name}</div>
            <div class="unit-info">${unit.description}</div>
            <div class="unit-stats">
                <span>عدد الأسئلة: ${unit.questions.length}</span>
            </div>
        </div>
    `).join('');
}

function toggleUnit(unitId) {
    const unitCard = document.querySelector(`[data-unit-id="${unitId}"]`);
    const startBtn = document.querySelector('.start-btn');
    
    if (unitCard.classList.contains('selected')) {
        unitCard.classList.remove('selected');
        gameState.selectedUnits = gameState.selectedUnits.filter(id => id !== unitId);
    } else {
        unitCard.classList.add('selected');
        gameState.selectedUnits.push(unitId);
    }

    startBtn.classList.toggle('active', gameState.selectedUnits.length > 0);
}
function startQuiz() {
    if (gameState.selectedUnits.length === 0) {
        swal({
            title: "تنبيه",
            text: "الرجاء اختيار وحدة واحدة على الأقل",
            icon: "warning"
        });
        return;
    }

    // جمع الأسئلة من الوحدات المختارة
    let allQuestions = [];
    gameState.selectedUnits.forEach(unitId => {
        const unit = quizData.units.find(u => u.id === unitId);
        unit.questions.forEach(q => {
            allQuestions.push({
                ...q,
                unitId: unit.id,
                unitName: unit.name
            });
        });
    });

    // الحصول على عدد الأسئلة المطلوب من input
    const requestedQuestionCount = parseInt(document.getElementById('questionCount').value);
    
    // التحقق من أن عدد الأسئلة المطلوب لا يتجاوز عدد الأسئلة المتوفرة
    const finalQuestionCount = Math.min(allQuestions.length, requestedQuestionCount);
    
    if (finalQuestionCount < requestedQuestionCount) {
        swal({
            title: "تنبيه",
            text: `عدد الأسئلة المتوفرة (${allQuestions.length}) أقل من العدد المطلوب (${requestedQuestionCount}). سيتم عرض جميع الأسئلة المتوفرة.`,
            icon: "info"
        });
    }

    // خلط الأسئلة عشوائياً
    gameState.currentQuestions = shuffleArray(allQuestions).slice(0, finalQuestionCount);
    
    // تحديث حالة اللعبة
    gameState.currentQuestionIndex = 0;
    gameState.score = 0;
    gameState.totalPossibleScore = gameState.currentQuestions.length;
    gameState.mistakes = [];

    // تحديث واجهة المستخدم
    document.getElementById('unitSelection').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    document.getElementById('totalScore').textContent = gameState.totalPossibleScore;
    document.getElementById('score').textContent = '0';
    document.getElementById('totalQuestions').textContent = gameState.currentQuestions.length;

    displayQuestion();
}
function displayQuestion() {
    const question = gameState.currentQuestions[gameState.currentQuestionIndex];
    
    document.getElementById('unitInfo').textContent = `الوحدة ${question.unitId}: ${question.unitName}`;
    document.getElementById('question').textContent = question.text;
    document.getElementById('questionNumber').textContent = `${gameState.currentQuestionIndex + 1}`;
    document.getElementById('totalQuestions').textContent = `${gameState.currentQuestions.length}`;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <div class="option" onclick="checkAnswer(${index})">
            ${option}
        </div>
    `).join('');
}

function checkAnswer(selectedIndex) {
    const question = gameState.currentQuestions[gameState.currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    
    options.forEach(option => option.style.pointerEvents = 'none');
    
    options[question.correct].classList.add('correct');
    if (selectedIndex === question.correct) {
        gameState.score++;
        document.getElementById('score').textContent = gameState.score;
    } else {
        options[selectedIndex].classList.add('wrong');
        gameState.mistakes.push({
            question: question.text,
            correctAnswer: question.options[question.correct],
            wrongAnswer: question.options[selectedIndex],
            unit: `الوحدة ${question.unitId}: ${question.unitName}`
        });
    }

    swal({
        title: selectedIndex === question.correct ? "إجابة صحيحة!" : "إجابة خاطئة",
        text: selectedIndex === question.correct ? 
            "أحسنت! +1 درجة" : 
            `الإجابة الصحيحة هي: ${question.options[question.correct]}`,
        icon: selectedIndex === question.correct ? "success" : "error",
        button: "التالي"
    }).then(() => {
        nextQuestion();
    });
}

function nextQuestion() {
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex >= gameState.currentQuestions.length) {
        showResults();
    } else {
        displayQuestion();
    }
}

function showResults() {
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    const finalScorePercentage = (gameState.score / gameState.totalPossibleScore) * 100;
    document.getElementById('finalScore').textContent = `${gameState.score} من ${gameState.totalPossibleScore}`;
    document.getElementById('mistakesCount').textContent = gameState.mistakes.length;
    
    const mistakesList = document.getElementById('mistakesList');
    mistakesList.innerHTML = gameState.mistakes.map(mistake => `
        <div class="mistake-item">
            <div class="unit-info">${mistake.unit}</div>
            <div class="question-text">${mistake.question}</div>
            <div class="correct-answer">الإجابة الصحيحة: ${mistake.correctAnswer}</div>
            <div class="wrong-answer">إجابتك: ${mistake.wrongAnswer}</div>
        </div>
    `).join('');
}

function resetQuiz() {
    gameState = {
        selectedUnits: [],
        currentQuestions: [],
        currentQuestionIndex: 0,
        score: 0,
        totalPossibleScore: 0,
        mistakes: []
    };
    
    document.querySelectorAll('.unit-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.getElementById('unitSelection').style.display = 'block';
    document.getElementById('results').style.display = 'none';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}