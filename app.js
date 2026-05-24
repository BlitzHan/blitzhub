// ============================================
// BlitzHub — app.js
// ============================================

// ─── Tema Yönetimi ───
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('blitzhub-theme') || 'dark';
  setTheme(saved);

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Zar tablosunu başlat
  renderDicePlaceholder(1);
  document.getElementById('dice-count-select-console').addEventListener('change', e => {
    renderDicePlaceholder(parseInt(e.target.value));
    document.getElementById('dice-total-panel-console').classList.add('hidden');
  });

  // LocalStorage verileri
  loadRpsScores();
  loadDiceStats();
  loadParticipants();
  loadCoinStats();
  loadMathHighScore();
});

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('blitzhub-theme', theme);
}

// ─── Sekme Yönetimi ───
function switchTab(id) {
  // Panelleri gizle
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  // Sekme aktifliğini kaldır
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  // Seçilen paneli göster
  document.getElementById(`panel-${id}`).classList.remove('hidden');
  document.getElementById(`tab-${id}`).classList.add('active');

  // Matematik oyununu durdur/sıfırla
  if (id !== 'math') {
    resetMathStage();
  }
}

// ============================================
// 1. TAŞ KAĞIT MAKAS
// ============================================

let rpsScores = { player: 0, computer: 0, draws: 0, streak: 0 };
let isRpsPlaying = false;

const rpsEmoji = { rock: '✊', paper: '✋', scissors: '✌️' };
const rpsNames = { rock: 'Taş', paper: 'Kağıt', scissors: 'Makas' };
const beats    = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

function loadRpsScores() {
  const saved = localStorage.getItem('blitzhub-rps-scores');
  if (saved) {
    rpsScores = JSON.parse(saved);
    updateRpsUI();
  }
}

function saveRpsScores() {
  localStorage.setItem('blitzhub-rps-scores', JSON.stringify(rpsScores));
}

function updateRpsUI() {
  document.getElementById('rps-score-player').textContent   = rpsScores.player;
  document.getElementById('rps-score-draws').textContent    = rpsScores.draws;
  document.getElementById('rps-score-computer').textContent = rpsScores.computer;

  const banner = document.getElementById('rps-streak-banner');
  if (rpsScores.streak >= 3) {
    document.getElementById('rps-streak-count').textContent = rpsScores.streak;
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

function resetRpsRound() {
  document.getElementById('rps-stage-idle').classList.remove('hidden');
  document.getElementById('rps-stage-battle').classList.add('hidden');
  document.getElementById('rps-result-panel').classList.add('hidden');
}

function resetRpsScores() {
  if (isRpsPlaying) return;
  if (!confirm('Tüm skoru sıfırlamak istiyor musun?')) return;
  rpsScores = { player: 0, computer: 0, draws: 0, streak: 0 };
  saveRpsScores();
  updateRpsUI();
  resetRpsRound();
}

function playRps(playerChoice) {
  if (isRpsPlaying) return;
  isRpsPlaying = true;

  // Savaş sahnesine geç
  document.getElementById('rps-stage-idle').classList.add('hidden');
  document.getElementById('rps-result-panel').classList.add('hidden');
  document.getElementById('rps-stage-battle').classList.remove('hidden');

  const playerHand   = document.getElementById('rps-battle-player');
  const computerHand = document.getElementById('rps-battle-computer');
  const playerLabel  = document.getElementById('rps-label-player');
  const compLabel    = document.getElementById('rps-label-computer');
  const countdown    = document.getElementById('rps-countdown-text');

  // Başlangıç
  playerHand.textContent   = rpsEmoji.rock;
  computerHand.textContent = rpsEmoji.rock;
  playerLabel.textContent  = 'Sen';
  compLabel.textContent    = 'Bilgisayar';
  playerHand.classList.add('shake-player');
  computerHand.classList.add('shake-computer');

  let val = 3;
  countdown.textContent = val;

  const interval = setInterval(() => {
    val--;
    countdown.textContent = val > 0 ? val : 'AÇ!';
    if (val <= 0) clearInterval(interval);
  }, 400);

  setTimeout(() => {
    playerHand.classList.remove('shake-player');
    computerHand.classList.remove('shake-computer');

    const choices = ['rock', 'paper', 'scissors'];
    const compChoice = choices[Math.floor(Math.random() * 3)];

    playerHand.textContent   = rpsEmoji[playerChoice];
    computerHand.textContent = rpsEmoji[compChoice];
    playerLabel.textContent  = rpsNames[playerChoice];
    compLabel.textContent    = rpsNames[compChoice];

    // Sonuç
    const resultText = document.getElementById('rps-result-text');
    const resultSub  = document.getElementById('rps-result-subtext');
    const resultPanel = document.getElementById('rps-result-panel');

    resultPanel.classList.remove('hidden');

    if (playerChoice === compChoice) {
      rpsScores.draws++;
      rpsScores.streak = 0;
      resultText.textContent = 'BERABERE!';
      resultText.className = 'result-text draw';
      resultSub.textContent = 'İki taraf da aynı hamleyi yaptı.';
    } else if (beats[playerChoice] === compChoice) {
      rpsScores.player++;
      rpsScores.streak++;
      resultText.textContent = 'KAZANDIN! 🎉';
      resultText.className = 'result-text win';
      resultSub.textContent = `${rpsNames[playerChoice]}, ${rpsNames[compChoice].toLowerCase()} yener.`;
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.7 } });
      if (rpsScores.streak >= 3) {
        setTimeout(() => confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b','#22c55e'] }), 250);
      }
    } else {
      rpsScores.computer++;
      rpsScores.streak = 0;
      resultText.textContent = 'KAYBETTİN!';
      resultText.className = 'result-text lose';
      resultSub.textContent = `${rpsNames[compChoice]}, ${rpsNames[playerChoice].toLowerCase()} yener.`;
    }

    saveRpsScores();
    updateRpsUI();
    isRpsPlaying = false;
  }, 1600);
}

// ============================================
// 2. ZAR ATMA
// ============================================

let diceStats   = { rollCount: 0, totalValue: 0 };
let diceHistory = [];

function loadDiceStats() {
  const s = localStorage.getItem('blitzhub-dice-stats');
  const h = localStorage.getItem('blitzhub-dice-history');
  if (s) diceStats   = JSON.parse(s);
  if (h) diceHistory = JSON.parse(h);
  updateDiceStatsUI();
  updateDiceHistoryUI();
}

function saveDiceStats() {
  localStorage.setItem('blitzhub-dice-stats',   JSON.stringify(diceStats));
  localStorage.setItem('blitzhub-dice-history',  JSON.stringify(diceHistory));
}

function updateDiceStatsUI() {
  document.getElementById('dice-stat-count-console').textContent   = diceStats.rollCount;
  const avg = diceStats.rollCount > 0 ? (diceStats.totalValue / diceStats.rollCount).toFixed(1) : '0.0';
  document.getElementById('dice-stat-average-console').textContent = avg;
}

function updateDiceHistoryUI() {
  const list = document.getElementById('dice-history-list-console');
  if (diceHistory.length === 0) {
    list.innerHTML = '<span class="empty-msg">Henüz atış yapılmadı.</span>';
    return;
  }
  list.innerHTML = diceHistory.map((item, i) => `
    <div class="history-item">
      <span class="history-dice">${diceHistory.length - i}. Atış: ${item.dice.join(' + ')}</span>
      <span class="history-total">= ${item.total}</span>
    </div>
  `).join('');
}

function clearDiceHistory() {
  diceHistory = [];
  diceStats   = { rollCount: 0, totalValue: 0 };
  saveDiceStats();
  updateDiceStatsUI();
  updateDiceHistoryUI();
}

function changeDiceCount(val) {
  renderDicePlaceholder(parseInt(val));
  document.getElementById('dice-total-panel-console').classList.add('hidden');
}

function renderDicePlaceholder(count) {
  const tabletop = document.getElementById('dice-tabletop-console');
  tabletop.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const scene = document.createElement('div');
    scene.className = 'dice-scene';
    scene.innerHTML = `
      <div class="dice show-1" id="dice-${i}">
        <div class="dice-face face-1"><div class="dice-dot"></div></div>
        <div class="dice-face face-2"><div class="dice-dot"></div><div class="dice-dot"></div></div>
        <div class="dice-face face-3"><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div></div>
        <div class="dice-face face-4"><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div></div>
        <div class="dice-face face-5"><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div></div>
        <div class="dice-face face-6"><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div></div>
      </div>`;
    tabletop.appendChild(scene);
  }
}

function rollDice() {
  const count  = parseInt(document.getElementById('dice-count-select-console').value);
  const btn    = document.getElementById('roll-dice-btn-console');
  const total$ = document.getElementById('dice-total-panel-console');
  const totalV = document.getElementById('dice-total-value-console');

  btn.disabled = true;

  // Animasyon başlat
  const diceEls = [];
  for (let i = 0; i < count; i++) {
    const d = document.getElementById(`dice-${i}`);
    if (d) { d.className = 'dice rolling'; diceEls.push(d); }
  }

  setTimeout(() => {
    let sum = 0;
    const rolls = [];
    diceEls.forEach(d => {
      const v = Math.floor(Math.random() * 6) + 1;
      rolls.push(v);
      sum += v;
      d.className = `dice show-${v}`;
    });

    totalV.textContent = sum;
    total$.classList.remove('hidden');

    diceStats.rollCount++;
    diceStats.totalValue += sum;
    diceHistory.unshift({ dice: rolls, total: sum });
    if (diceHistory.length > 20) diceHistory.pop();

    saveDiceStats();
    updateDiceStatsUI();
    updateDiceHistoryUI();

    btn.disabled = false;

    if (sum === count * 6) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: ['#f59e0b','#ffffff'] });
    }
  }, 950);
}

// ============================================
// 3. ÇEKİLİŞ
// ============================================

let participants = [];

function loadParticipants() {
  const s = localStorage.getItem('blitzhub-participants');
  if (s) {
    participants = JSON.parse(s);
    renderParticipants();
  }
}

function saveParticipants() {
  localStorage.setItem('blitzhub-participants', JSON.stringify(participants));
}

function handleNameInputKey(e) {
  if (e.key === 'Enter') addParticipant();
}

function addParticipant() {
  const input = document.getElementById('raffle-name-input-console');
  const name  = input.value.trim();
  if (!name) return;
  if (participants.includes(name)) { alert('Bu isim zaten listede!'); return; }
  participants.push(name);
  input.value = '';
  input.focus();
  saveParticipants();
  renderParticipants();
}

function addBulkParticipants() {
  const area = document.getElementById('raffle-bulk-input-console');
  const names = area.value.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
  let added = 0;
  names.forEach(n => {
    if (!participants.includes(n)) { participants.push(n); added++; }
  });
  area.value = '';
  if (added > 0) { saveParticipants(); renderParticipants(); }
}

function removeParticipant(i) {
  participants.splice(i, 1);
  saveParticipants();
  renderParticipants();
}

function clearParticipants() {
  if (!confirm('Tüm aday listesini silmek istiyor musun?')) return;
  participants = [];
  saveParticipants();
  renderParticipants();
}

function renderParticipants() {
  const container  = document.getElementById('participants-list-console');
  const badge      = document.getElementById('participant-count-badge-console');
  badge.textContent = `${participants.length} Aday`;

  if (participants.length === 0) {
    container.innerHTML = '<span class="empty-msg">Aday listesi boş.</span>';
    return;
  }
  container.innerHTML = participants.map((name, i) => `
    <span class="participant-chip">
      ${name}
      <button class="chip-remove" onclick="removeParticipant(${i})" title="Kaldır">×</button>
    </span>
  `).join('');
}

function drawRaffle() {
  const winCount  = Math.max(1, parseInt(document.getElementById('winner-count-console').value) || 1);
  const backCount = Math.max(0, parseInt(document.getElementById('backup-count-console').value)  || 0);

  if (participants.length < winCount) {
    alert(`En az ${winCount} aday gerekli!`);
    return;
  }

  const btn       = document.getElementById('draw-btn-console');
  const shuffStage = document.getElementById('raffle-stage-shuffling-console');
  const resStage   = document.getElementById('raffle-stage-results-console');
  const shuffBox   = document.getElementById('raffle-shuffle-box-console');

  btn.disabled = true;
  resStage.classList.add('hidden');
  shuffStage.classList.remove('hidden');

  const shuffleInterval = setInterval(() => {
    shuffBox.textContent = participants[Math.floor(Math.random() * participants.length)];
  }, 100);

  setTimeout(() => {
    clearInterval(shuffleInterval);

    // Fisher-Yates karıştırma
    const list = [...participants];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    const winners = list.slice(0, winCount);
    const backups = list.slice(winCount, winCount + backCount);

    // Kazananlar
    document.getElementById('raffle-winners-output-console').innerHTML =
      winners.map((w, idx) => `
        <div class="winner-item">
          <div class="winner-left">
            <span class="winner-rank">${idx + 1}</span>
            <span class="winner-name">${w}</span>
          </div>
          <span class="winner-tag">KAZANDI</span>
        </div>
      `).join('');

    // Yedekler
    const backupsContainer = document.getElementById('raffle-backups-container-console');
    if (backups.length > 0) {
      document.getElementById('raffle-backups-output-console').innerHTML =
        backups.map((b, idx) => `
          <span class="backup-chip">
            <span class="backup-num">${idx + 1}. Yedek</span>
            ${b}
          </span>
        `).join('');
      backupsContainer.classList.remove('hidden');
    } else {
      backupsContainer.classList.add('hidden');
    }

    shuffStage.classList.add('hidden');
    resStage.classList.remove('hidden');
    btn.disabled = false;

    triggerGiveawayConfetti();
  }, 2200);
}

function resetRaffle() {
  document.getElementById('raffle-stage-results-console').classList.add('hidden');
  document.getElementById('raffle-stage-shuffling-console').classList.add('hidden');
}

function triggerGiveawayConfetti() {
  const end = Date.now() + 2500;
  (function frame() {
    confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0, y: 0.8 }, colors: ['#f59e0b','#22c55e'] });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: ['#f59e0b','#22c55e'] });
    if (Date.now() < end) requestAnimationFrame(frame);
  }());
}

// ============================================
// 4. YAZI TURA (COIN FLIP)
// ============================================

let coinStats = { totalCount: 0, headsCount: 0, tailsCount: 0 };
let coinHistory = [];
let isCoinFlipping = false;
let currentCoinRotation = 0;

function loadCoinStats() {
  const statsSaved = localStorage.getItem('blitzhub-coin-stats');
  const historySaved = localStorage.getItem('blitzhub-coin-history');
  if (statsSaved) coinStats = JSON.parse(statsSaved);
  if (historySaved) coinHistory = JSON.parse(historySaved);
  updateCoinUI();
  updateCoinHistoryUI();
}

function saveCoinStats() {
  localStorage.setItem('blitzhub-coin-stats', JSON.stringify(coinStats));
  localStorage.setItem('blitzhub-coin-history', JSON.stringify(coinHistory));
}

function updateCoinUI() {
  document.getElementById('coin-stat-total').textContent = coinStats.totalCount;
  const headsPercent = coinStats.totalCount > 0 ? Math.round((coinStats.headsCount / coinStats.totalCount) * 100) : 0;
  const tailsPercent = coinStats.totalCount > 0 ? Math.round((coinStats.tailsCount / coinStats.totalCount) * 100) : 0;
  
  document.getElementById('coin-stat-heads').textContent = `${coinStats.headsCount} (${headsPercent}%)`;
  document.getElementById('coin-stat-tails').textContent = `${coinStats.tailsCount} (${tailsPercent}%)`;
}

function updateCoinHistoryUI() {
  const list = document.getElementById('coin-history-list');
  if (coinHistory.length === 0) {
    list.innerHTML = '<span class="empty-msg">Henüz fırlatma yapılmadı.</span>';
    return;
  }
  list.innerHTML = coinHistory.map(item => `
    <span class="coin-chip ${item === 'TURA' ? 'chip-tails' : ''}" title="${item}">
      ${item === 'YAZI' ? 'Y' : 'T'}
    </span>
  `).join('');
}

function clearCoinHistory() {
  coinStats = { totalCount: 0, headsCount: 0, tailsCount: 0 };
  coinHistory = [];
  saveCoinStats();
  updateCoinUI();
  updateCoinHistoryUI();
  document.getElementById('coin-result-text').textContent = '—';
}

function flipCoin() {
  if (isCoinFlipping) return;
  isCoinFlipping = true;

  const btn = document.getElementById('flip-coin-btn');
  const coin = document.getElementById('coin-element');
  const resultText = document.getElementById('coin-result-text');

  btn.disabled = true;
  resultText.textContent = 'Dönüyor...';

  // Random result: 0 for heads (Yazı), 1 for tails (Tura)
  const resultVal = Math.floor(Math.random() * 2);
  const result = resultVal === 0 ? 'YAZI' : 'TURA';

  // Spin animation: smooth cumulative degrees
  let extraSpins = (5 + Math.floor(Math.random() * 4)) * 360; // 1800, 2160, etc.
  currentCoinRotation += extraSpins;
  
  let currentMod = currentCoinRotation % 360;
  if (result === 'YAZI') {
    currentCoinRotation += (360 - currentMod) % 360;
  } else {
    currentCoinRotation += (540 - currentMod) % 360;
  }

  coin.style.transform = `rotateY(${currentCoinRotation}deg)`;

  setTimeout(() => {
    resultText.textContent = resultVal === 0 ? '🪙 YAZI GELDİ!' : '⚡ TURA GELDİ!';
    
    // Update stats
    coinStats.totalCount++;
    if (resultVal === 0) {
      coinStats.headsCount++;
    } else {
      coinStats.tailsCount++;
    }
    
    coinHistory.unshift(result);
    if (coinHistory.length > 20) {
      coinHistory.pop();
    }

    saveCoinStats();
    updateCoinUI();
    updateCoinHistoryUI();

    btn.disabled = false;
    isCoinFlipping = false;
  }, 2000);
}

// ============================================
// 5. HIZLI MATEMATİK (MATH CHALLENGE)
// ============================================

let mathHighScore = 0;
let mathScore = 0;
let mathTimeRemaining = 10.0;
let mathTimerInterval = null;
let currentMathAnswer = 0;
let mathIsActive = false;

function loadMathHighScore() {
  const saved = localStorage.getItem('blitzhub-math-highscore');
  if (saved) {
    mathHighScore = parseInt(saved) || 0;
  }
  document.getElementById('math-highscore-val').textContent = mathHighScore;
}

function saveMathHighScore() {
  localStorage.setItem('blitzhub-math-highscore', mathHighScore);
}

function startMathGame() {
  mathScore = 0;
  mathIsActive = true;
  document.getElementById('math-stage-start').classList.add('hidden');
  document.getElementById('math-stage-over').classList.add('hidden');
  document.getElementById('math-stage-play').classList.remove('hidden');
  
  document.getElementById('math-current-score').textContent = mathScore;
  
  generateMathQuestion();
}

function generateMathQuestion() {
  if (!mathIsActive) return;

  let num1, num2, operator, questionText;
  
  if (mathScore < 5) {
    operator = Math.random() < 0.5 ? '+' : '-';
    num1 = Math.floor(Math.random() * 19) + 2; // 2-20
    num2 = Math.floor(Math.random() * 19) + 2; // 2-20
    if (operator === '-' && num1 < num2) {
      [num1, num2] = [num2, num1];
    }
  } else if (mathScore < 10) {
    const ops = ['+', '-', '*'];
    operator = ops[Math.floor(Math.random() * ops.length)];
    if (operator === '*') {
      num1 = Math.floor(Math.random() * 8) + 2; // 2-9
      num2 = Math.floor(Math.random() * 8) + 2; // 2-9
    } else {
      num1 = Math.floor(Math.random() * 49) + 2; // 2-50
      num2 = Math.floor(Math.random() * 49) + 2; // 2-50
      if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
    }
  } else if (mathScore < 20) {
    const ops = ['+', '-', '*', '/'];
    operator = ops[Math.floor(Math.random() * ops.length)];
    if (operator === '*') {
      num1 = Math.floor(Math.random() * 11) + 2; // 2-12
      num2 = Math.floor(Math.random() * 11) + 2; // 2-12
    } else if (operator === '/') {
      num2 = Math.floor(Math.random() * 8) + 2; // 2-9 divisor
      currentMathAnswer = Math.floor(Math.random() * 9) + 2; // 2-10 quotient
      num1 = num2 * currentMathAnswer; // integer dividend
    } else {
      num1 = Math.floor(Math.random() * 99) + 2; // 2-100
      num2 = Math.floor(Math.random() * 99) + 2; // 2-100
    }
  } else {
    const ops = ['+', '-', '*', '/'];
    operator = ops[Math.floor(Math.random() * ops.length)];
    if (operator === '*') {
      num1 = Math.floor(Math.random() * 14) + 6; // 6-19
      num2 = Math.floor(Math.random() * 14) + 6; // 6-19
    } else if (operator === '/') {
      num2 = Math.floor(Math.random() * 11) + 4; // 4-14
      currentMathAnswer = Math.floor(Math.random() * 11) + 4; // 4-14
      num1 = num2 * currentMathAnswer;
    } else {
      num1 = Math.floor(Math.random() * 199) + 10;
      num2 = Math.floor(Math.random() * 199) + 10;
    }
  }

  if (operator !== '/') {
    if (operator === '+') currentMathAnswer = num1 + num2;
    else if (operator === '-') currentMathAnswer = num1 - num2;
    else if (operator === '*') currentMathAnswer = num1 * num2;
  }

  let opDisplay = operator;
  if (operator === '*') opDisplay = '×';
  if (operator === '/') opDisplay = '÷';

  questionText = `${num1} ${opDisplay} ${num2} = ?`;
  document.getElementById('math-question-text').textContent = questionText;

  const options = new Set();
  options.add(currentMathAnswer);

  while (options.size < 4) {
    let fake;
    const diff = Math.floor(Math.random() * 10) + 1;
    const sign = Math.random() < 0.5 ? -1 : 1;
    
    if (Math.random() < 0.4) {
      fake = currentMathAnswer + (sign * diff);
    } else if (Math.random() < 0.7 && currentMathAnswer > 5) {
      fake = currentMathAnswer + (sign * (Math.floor(Math.random() * 3) + 1) * 2);
    } else {
      fake = currentMathAnswer + (sign * 10);
    }
    
    if (fake !== currentMathAnswer && (operator !== '/' || fake >= 0)) {
      options.add(fake);
    }
  }

  const optionsArr = Array.from(options);
  for (let i = optionsArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsArr[i], optionsArr[j]] = [optionsArr[j], optionsArr[i]];
  }

  const container = document.getElementById('math-options-container');
  container.innerHTML = optionsArr.map(opt => `
    <button class="math-option-btn" onclick="handleMathAnswer(${opt})">${opt}</button>
  `).join('');

  mathTimeRemaining = 10.0;
  if (mathTimerInterval) clearInterval(mathTimerInterval);
  
  const timerText = document.getElementById('math-timer-text');
  const timerBar = document.getElementById('math-timer-bar');
  timerText.textContent = mathTimeRemaining.toFixed(1);
  timerBar.style.width = '100%';

  const timeStart = Date.now();
  const timeLimit = 10000; // 10s

  mathTimerInterval = setInterval(() => {
    const elapsed = Date.now() - timeStart;
    mathTimeRemaining = Math.max(0, (timeLimit - elapsed) / 1000);
    timerText.textContent = mathTimeRemaining.toFixed(1);
    timerBar.style.width = `${(mathTimeRemaining / 10) * 100}%`;

    if (mathTimeRemaining <= 0) {
      clearInterval(mathTimerInterval);
      endMathGame();
    }
  }, 50);
}

function handleMathAnswer(selected) {
  if (!mathIsActive) return;
  
  if (selected === currentMathAnswer) {
    mathScore++;
    document.getElementById('math-current-score').textContent = mathScore;
    generateMathQuestion();
  } else {
    endMathGame();
  }
}

function endMathGame() {
  mathIsActive = false;
  if (mathTimerInterval) clearInterval(mathTimerInterval);

  document.getElementById('math-stage-play').classList.add('hidden');
  const overStage = document.getElementById('math-stage-over');
  overStage.classList.remove('hidden');

  document.getElementById('math-final-score-val').textContent = mathScore;

  const recordBanner = document.getElementById('math-new-record');
  if (mathScore > mathHighScore) {
    mathHighScore = mathScore;
    saveMathHighScore();
    document.getElementById('math-highscore-val').textContent = mathHighScore;
    recordBanner.classList.remove('hidden');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#f59e0b', '#22c55e', '#ffffff'] });
  } else {
    recordBanner.classList.add('hidden');
  }
}

function resetMathStage() {
  mathIsActive = false;
  if (mathTimerInterval) clearInterval(mathTimerInterval);
  
  document.getElementById('math-stage-play').classList.add('hidden');
  document.getElementById('math-stage-over').classList.add('hidden');
  document.getElementById('math-stage-start').classList.remove('hidden');
}
