const flagImage = document.getElementById('flag-image');
const options = document.querySelectorAll('.option');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const highScoreElement = document.getElementById('high-score');
const hintButton = document.getElementById('hint-btn');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const gameOverModal = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const langToggle = document.getElementById('lang-toggle');

const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const gameOverSound = document.getElementById('game-over-sound');
const hintSound = document.getElementById('hint-sound');
const tickSound = document.getElementById('tick-sound');

let currentFlag = null;
let score = 0;
let timeLeft = 30;
let timer = null;
let highScore = localStorage.getItem('highScore') || 0;
let hintsLeft = 3;
let isGameActive = false;
let countries = [];
let lang = 'tr'; // Varsayılan Türkçe

async function loadFlags() {
    try {
        const response = await fetch('flags.json');
        countries = await response.json();
        console.log(`${countries.length} bayrak yüklendi`);
    } catch (error) {
        console.error('Bayraklar yüklenirken hata oluştu:', error);
        alert('Bayrak verileri yüklenirken bir hata oluştu!');
    }
}

highScoreElement.textContent = highScore;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomCountries() {
    const selectedCountries = [];
    const tempCountries = [...countries];
    for (let i = 0; i < 4; i++) {
        const randomIndex = getRandomInt(tempCountries.length);
        selectedCountries.push(tempCountries[randomIndex]);
        tempCountries.splice(randomIndex, 1);
    }
    return selectedCountries;
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeElement.textContent = timeLeft;
        if (timeLeft <= 5) tickSound.play().catch(err => console.log('Ses hatası:', err));
    } else {
        endGame();
    }
}

async function startGame() {
    if (countries.length === 0) await loadFlags();
    isGameActive = true;
    score = 0;
    timeLeft = 30;
    hintsLeft = 3;
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    hintButton.textContent = `İpucu (${hintsLeft})`;
    gameOverModal.classList.add('hidden');
    if (timer) clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    createNewQuestion();
}

function endGame() {
    isGameActive = false;
    clearInterval(timer);
    gameOverSound.play().catch(err => console.log('Ses hatası:', err));
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
    finalScoreElement.textContent = score;
    gameOverModal.classList.remove('hidden');
}

function createNewQuestion() {
    const selectedCountries = getRandomCountries();
    currentFlag = selectedCountries[getRandomInt(4)];
    flagImage.src = `public/flags/${currentFlag.code}.svg`;
    selectedCountries.sort(() => Math.random() - 0.5);
    options.forEach((option, index) => {
        option.textContent = selectedCountries[index][`name_${lang}`];
        option.classList.remove('correct', 'wrong', 'disabled');
    });
}

function toggleLang() {
    lang = lang === 'tr' ? 'en' : 'tr';
    if (!isGameActive) {
        createNewQuestion(); // Oyun başlamadıysa dili güncelle
    }
}

function useHint() {
    if (hintsLeft > 0 && isGameActive) {
        hintsLeft--;
        hintButton.textContent = `Hint (${hintsLeft})`;
        hintSound.play().catch(err => console.log('Ses hatası:', err));
        const wrongOptions = Array.from(options).filter(option => option.textContent !== currentFlag[`name_${lang}`]);
        for (let i = 0; i < 2; i++) {
            const randomIndex = getRandomInt(wrongOptions.length);
            wrongOptions[randomIndex].classList.add('disabled');
            wrongOptions.splice(randomIndex, 1);
        }
    }
}

function checkAnswer(selectedOption) {
    if (!isGameActive || selectedOption.classList.contains('disabled')) return;
    const selectedCountry = selectedOption.textContent;
    if (selectedCountry === currentFlag[`name_${lang}`]) {
        selectedOption.classList.add('correct');
        score++;
        scoreElement.textContent = score;
        correctSound.play().catch(err => console.log('Ses hatası:', err));
    } else {
        selectedOption.classList.add('wrong');
        options.forEach(option => {
            if (option.textContent === currentFlag[`name_${lang}`]) option.classList.add('correct');
        });
        wrongSound.play().catch(err => console.log('Ses hatası:', err));
    }
    options.forEach(option => option.classList.add('disabled'));
    setTimeout(createNewQuestion, 1000);
}

options.forEach(option => option.addEventListener('click', () => checkAnswer(option)));
hintButton.addEventListener('click', useHint);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
langToggle.addEventListener('click', toggleLang);

loadFlags();