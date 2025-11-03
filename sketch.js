// 狀態常數
const STATE_LOADING = 0;
const STATE_QUIZ = 1;
const STATE_RESULT = 2;

let quizState = STATE_LOADING; // 遊戲狀態
let allQuestions;             // 儲存所有題目的 Table 物件
let selectedQuestions = [];   // 隨機選出的 3 題
let currentQuestionIndex = 0; // 當前題目索引 (0 到 2)
let score = 0;                // 分數
let maxQuestions = 3;         // 測驗題數
let buttonA, buttonB, buttonC, buttonD; // 選項按鈕

let questionTitle = "載入中..."; // 顯示的問題文字

function preload() {
  // 載入 PSV 檔案。'header' 表示第一行是標題，'|' 表示使用管道符號分隔。
  allQuestions = loadTable('question_bank_sample.csv', 'header', '|');
}

function setup() {
  createCanvas(600, 400);
  background(220);
  textAlign(CENTER, CENTER);
  textSize(24);
  
  // 初始化按鈕
  buttonA = createButton('A');
  buttonB = createButton('B');
  buttonC = createButton('C');
  buttonD = createButton('D');
  
  // 設定按鈕樣式與位置
  setupButtons();

  // 檢查題庫是否成功載入
  if (allQuestions.getRowCount() > 0) {
    selectRandomQuestions();
    quizState = STATE_QUIZ;
  } else {
    questionTitle = "題庫載入失敗或題庫為空！";
  }
}

function draw() {
  background(240); // 淺灰色背景
  
  if (quizState === STATE_QUIZ) {
    displayQuiz();
  } else if (quizState === STATE_RESULT) {
    displayResult();
  } else if (quizState === STATE_LOADING) {
    fill(50);
    text(questionTitle, width / 2, height / 2);
  }
}

// 設定按鈕的共同屬性
function setupButtons() {
  let buttonWidth = 120;
  let buttonHeight = 40;
  let gap = 20;
  let startX = width / 2 - (buttonWidth * 2 + gap * 1.5);
  let buttonY = height - 80;

  buttonA.size(buttonWidth, buttonHeight).position(startX, buttonY).mousePressed(() => checkAnswer('A'));
  buttonB.size(buttonWidth, buttonHeight).position(startX + buttonWidth + gap, buttonY).mousePressed(() => checkAnswer('B'));
  buttonC.size(buttonWidth, buttonHeight).position(startX + buttonWidth * 2 + gap * 2, buttonY).mousePressed(() => checkAnswer('C'));
  buttonD.size(buttonWidth, buttonHeight).position(startX + buttonWidth * 3 + gap * 3, buttonY).mousePressed(() => checkAnswer('D'));
  
  buttonA.style('font-size', '18px');
  buttonB.style('font-size', '18px');
  buttonC.style('font-size', '18px');
  buttonD.style('font-size', '18px');
}

// 從題庫中隨機選取 maxQuestions 題
function selectRandomQuestions() {
  let indices = [];
  let numRows = allQuestions.getRowCount();
  
  // 生成所有可能的索引
  for (let i = 0; i < numRows; i++) {
    indices.push(i);
  }
  
  // Fisher-Yates 洗牌算法
  for (let i = numRows - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  // 選取前 maxQuestions 個索引的題目
  for (let i = 0; i < maxQuestions && i < numRows; i++) {
    selectedQuestions.push(allQuestions.getRow(indices[i]));
  }
}

// 顯示當前題目
function displayQuiz() {
  let q = selectedQuestions[currentQuestionIndex];
  
  // 顯示題目標題 (例如: 第 1 題 / 共 3 題)
  fill(100);
  textSize(16);
  text(`第 ${currentQuestionIndex + 1} 題 / 共 ${maxQuestions} 題`, width / 2, 40);

  // 顯示問題
  fill(0);
  textSize(28);
  text(q.getString('問題'), width / 2, 100);

  // 顯示選項 (在按鈕上顯示)
  buttonA.html(`A. ${q.getString('選項A')}`);
  buttonB.html(`B. ${q.getString('選項B')}`);
  buttonC.html(`C. ${q.getString('選項C')}`);
  buttonD.html(`D. ${q.getString('選項D')}`);
}

// 檢查答案
function checkAnswer(userAnswer) {
  if (quizState !== STATE_QUIZ) return;

  let currentQ = selectedQuestions[currentQuestionIndex];
  let correctAnswer = currentQ.getString('正確答案');

  if (userAnswer === correctAnswer) {
    score++;
  }

  // 移至下一題
  currentQuestionIndex++;

  if (currentQuestionIndex >= maxQuestions) {
    quizState = STATE_RESULT; // 測驗結束
    // 隱藏按鈕
    buttonA.hide();
    buttonB.hide();
    buttonC.hide();
    buttonD.hide();
  } else {
    // 進入下一題
    // 清空按鈕上的舊選項文字，會在 draw 中更新
    buttonA.html('A');
    buttonB.html('B');
    buttonC.html('C');
    buttonD.html('D');
  }
}

// 顯示結果畫面
function displayResult() {
  // 成績計算
  let percentage = (score / maxQuestions) * 100;
  let feedback = "";

  // 回饋用語
  if (percentage === 100) {
    feedback = "太棒了！滿分！你是數學小天才！";
  } else if (percentage >= 66) {
    feedback = "表現不錯！繼續努力會更好！";
  } else {
    feedback = "要多練習喔！再試一次吧！";
  }

  fill(0, 100, 200);
  textSize(40);
  text("測驗結果", width / 2, 100);

  fill(50);
  textSize(32);
  text(`您的得分：${score} / ${maxQuestions} 題`, width / 2, 180);

  fill(0, 150, 0);
  textSize(24);
  text(feedback, width / 2, 250);
  
  // 重新開始按鈕
  let restartButton = select('#restartButton');
  if (!restartButton) {
    restartButton = createButton('再測一次');
    restartButton.id('restartButton');
    restartButton.size(150, 50).position(width / 2 - 75, height - 80).mousePressed(restartQuiz);
    restartButton.style('font-size', '20px');
  } else {
    restartButton.show();
  }
}

// 重新開始測驗
function restartQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  selectedQuestions = [];
  
  // 重新選取題目
  selectRandomQuestions();
  
  // 顯示按鈕
  buttonA.show();
  buttonB.show();
  buttonC.show();
  buttonD.show();
  
  // 隱藏重新開始按鈕
  select('#restartButton').hide();
  
  quizState = STATE_QUIZ;
}

// 視窗大小改變時，重新調整按鈕位置
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupButtons();
}