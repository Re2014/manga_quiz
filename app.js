// 【重要】まず、HTMLの要素を取得しておく
const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen'); // 結果画面も取得

const startButton = document.getElementById('start-button');
const quoteTextElement = document.getElementById('quote-text');
const titleHintElement = document.getElementById('title-hint');
const choicesContainer = document.getElementById('choices-container');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const resultText = document.getElementById('result-text');
const retryButton = document.getElementById('retry-button');

let allQuizData = []; // JSONから読み込んだ全クイズデータ
let currentQuizIndex = 0; // 現在何問目か
let correctAnswers = 0; // 正解数
const totalQuestions = 10; // 出題する問題数 (JSONのデータ数に合わせて調整)
let selectedQuestions = []; // 今回のクイズで出題する問題

// --- イベントリスナーの設定 ---
startButton.onclick = startGame;
nextButton.onclick = showNextQuiz;
retryButton.onclick = resetGame;

// --- 画面切り替え関数 ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// --- メインの処理 ---
// 1. JSONファイルを読み込む
fetch('quotes.json')
    .then(response => response.json())
    .then(data => {
        allQuizData = data;
    })
    .catch(error => {
        console.error('Error loading quiz data:', error);
        alert('クイズデータの読み込みに失敗しました。');
    });

// 2. ゲーム開始処理
function startGame() {
    correctAnswers = 0;
    currentQuizIndex = 0;
    feedbackElement.textContent = '';
    nextButton.style.display = 'none';

    // 出題する問題をランダムに選ぶ（totalQuestions分）
    selectedQuestions = shuffleArray(allQuizData).slice(0, totalQuestions);

    showScreen('game-screen'); // ゲーム画面に切り替え
    showQuiz(); // 最初のクイズを表示
}

// 3. クイズを表示する関数
function showQuiz() {
    if (currentQuizIndex >= selectedQuestions.length) {
        showResult(); // 全問終了
        return;
    }

    const quiz = selectedQuestions[currentQuizIndex];

    // 問題文とヒントを表示
    quoteTextElement.textContent = quiz.quote;
    titleHintElement.textContent = `【ヒント】${quiz.title}`;

    // 選択肢の生成
    const correctAnswer = quiz.character;
    const dummyChoices = generateDummyChoices(correctAnswer);
    const choices = [correctAnswer, ...dummyChoices];

    // 選択肢をシャッフル（重要）
    const shuffledChoices = shuffleArray(choices);

    // 選択肢ボタンの生成
    choicesContainer.innerHTML = ''; // 前のボタンをクリア
    shuffledChoices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.className = 'choice';
        button.onclick = () => checkAnswer(choice, correctAnswer, button); // クリック時の処理
        choicesContainer.appendChild(button);
    });

    // フィードバックと次の問題ボタンをリセット
    feedbackElement.textContent = '';
    feedbackElement.classList.remove('correct', 'incorrect');
    nextButton.style.display = 'none';
}

// 4. ダミー選択肢を生成する関数
function generateDummyChoices(correctAnswer) {
    const dummies = [];
    // 今回の出題リストではなく、全キャラクターから選ぶ
    const allCharacters = allQuizData.map(q => q.character);
    // 正解と重複しないようにダミーを3つ選ぶ
    while (dummies.length < 3) {
        const randomIndex = Math.floor(Math.random() * allCharacters.length);
        const dummy = allCharacters[randomIndex];
        // 正解と被らず、かつダミーリスト内でも被らないようにする
        if (dummy !== correctAnswer && !dummies.includes(dummy)) {
            dummies.push(dummy);
        }
    }
    return dummies;
}

// 5. 配列をシャッフルする関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 6. 回答をチェックする関数
function checkAnswer(selectedChoice, correctAnswer, clickedButton) {
    // 全ての選択肢ボタンを無効化
    Array.from(choicesContainer.children).forEach(button => {
        button.disabled = true;
        // 正解の選択肢に色を付ける
        if (button.textContent === correctAnswer) {
            button.style.backgroundColor = 'rgba(76, 175, 80, 0.4)'; // 緑色
            button.style.borderColor = 'rgba(76, 175, 80, 0.6)';
        }
    });

    if (selectedChoice === correctAnswer) {
        feedbackElement.textContent = "正解！";
        feedbackElement.classList.add('correct');
        feedbackElement.classList.remove('incorrect');
        correctAnswers++;
    } else {
        feedbackElement.textContent = `不正解... 正解は「${correctAnswer}」でした。`;
        feedbackElement.classList.add('incorrect');
        feedbackElement.classList.remove('correct');
        // 不正解の選択肢を赤くする
        clickedButton.style.backgroundColor = 'rgba(244, 67, 54, 0.4)';
        clickedButton.style.borderColor = 'rgba(244, 67, 54, 0.6)';
    }

    // 「次の問題へ」ボタンを表示
    nextButton.style.display = 'block';
}

// 7. 「次の問題へ」ボタンが押されたときの処理
function showNextQuiz() {
    currentQuizIndex++;
    showQuiz();
}

// 8. 結果を表示する関数
function showResult() {
    showScreen('result-screen'); // 結果画面に切り替え
    resultText.textContent = `${totalQuestions}問中 ${correctAnswers}問正解！`;
}

// 9. 「もう一度挑戦する」ボタンの処理
function resetGame() {
    showScreen('home-screen'); // ホーム画面に戻る
}

// アプリ起動時はホーム画面を表示
showScreen('home-screen');