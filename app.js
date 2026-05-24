// ==========================================
// 1. TEMA & SEKME YÖNETİMİ
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Tema Kontrolü
  const savedTheme = localStorage.getItem('blitzhub-theme') || 'dark';
  setTheme(savedTheme);

  const themeToggleBtn = document.getElementById('theme-toggle');
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // Lucide İkonlarını Yükle
  lucide.createIcons();

  // İlk Zarları Hazırla
  const diceCountSelect = document.getElementById('dice-count-select');
  renderDicePlaceholder(parseInt(diceCountSelect.value));
  
  diceCountSelect.addEventListener('change', (e) => {
    renderDicePlaceholder(parseInt(e.target.value));
    document.getElementById('dice-total-panel').classList.add('hidden');
  });

  // LocalStorage'dan Çekiliş Katılımcılarını Yükle
  loadParticipants();

  // LocalStorage'dan Skorları Yükle
  loadRpsScores();
  loadDiceStats();
});

function setTheme(theme) {
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  }
  localStorage.setItem('blitzhub-theme', theme);
}

function switchTab(tabId) {
  // Tüm sekmeleri gizle
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => content.classList.add('hidden'));

  // Tüm butonlardan aktifliği kaldır
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active', 'text-brand-gold', 'bg-slate-100', 'dark:bg-slate-800/30', 'border-brand-gold');
    btn.classList.add('text-slate-600', 'dark:text-slate-400');
  });

  // Seçilen sekmeyi göster
  const activeContent = document.getElementById(`tab-content-${tabId}`);
  if (activeContent) activeContent.classList.remove('hidden');

  // Seçilen butonu aktifleştir
  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'text-brand-gold', 'bg-slate-100', 'dark:bg-slate-800/30', 'border-brand-gold');
    activeBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
  }
  
  // Lucide ikonlarını yeniden oluştur
  lucide.createIcons();
}


// ==========================================
// 2. TAŞ KAĞIT MAKAS OYUN MOTORU (SALLAMA & SÜRE EKLENDİ)
// ==========================================

let rpsScores = { player: 0, computer: 0, draws: 0, streak: 0 };
let isRpsPlaying = false; // Spam tıklamayı önleme bayrağı

// SVG Vektör Tanımlamaları (✊, ✋, ✌️ ikonları)
const rpsSvgs = {
  rock: `<svg class="w-16 h-16 text-brand-teal drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 10V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M14 10V7a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
          <path d="M10 10V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
          <path d="M18 10a2 2 0 0 1 2 2v2a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8v-3" />
          <path d="M6 13V9a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v4" />
        </svg>`,
  paper: `<svg class="w-16 h-16 text-brand-teal drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M18 8a2 2 0 1 1 4 0v6a10 10 0 0 1-10 10h-2A10 10 0 0 1 0 14V8a2 2 0 1 1 4 0v4" />
           <path d="M6 8a2 2 0 1 1 4 0v4" />
           <path d="M10 6a2 2 0 1 1 4 0v6" />
           <path d="M14 5a2 2 0 1 1 4 0v7" />
         </svg>`,
  scissors: `<svg class="w-16 h-16 text-brand-teal drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 10V4a2 2 0 1 1 4 0v4" />
              <path d="M14 10V2a2 2 0 1 1 4 0v8" />
              <path d="M18 12a2 2 0 1 1 4 0v2a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8v-3" />
              <path d="M6 14v-2a2 2 0 1 1 4 0v2" />
              <path d="M10 14H6" />
            </svg>`
};

const rpsNames = {
  rock: 'Taş',
  paper: 'Kağıt',
  scissors: 'Makas'
};

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
  document.getElementById('rps-score-player').textContent = rpsScores.player;
  document.getElementById('rps-score-draws').textContent = rpsScores.draws;
  document.getElementById('rps-score-computer').textContent = rpsScores.computer;
  
  const streakBanner = document.getElementById('rps-streak-banner');
  const streakCount = document.getElementById('rps-streak-count');
  
  if (rpsScores.streak >= 3) {
    streakCount.textContent = rpsScores.streak;
    streakBanner.classList.remove('hidden');
    streakBanner.classList.add('flex');
  } else {
    streakBanner.classList.add('hidden');
    streakBanner.classList.remove('flex');
  }
}

function resetRpsScores() {
  if (isRpsPlaying) return;
  rpsScores = { player: 0, computer: 0, draws: 0, streak: 0 };
  saveRpsScores();
  updateRpsUI();
  
  // Arayüz durumunu sıfırla
  document.getElementById('rps-stage-idle').classList.remove('hidden');
  document.getElementById('rps-stage-battle').classList.add('hidden');
  document.getElementById('rps-result-panel').classList.add('hidden');
}

function playRps(playerChoice) {
  if (isRpsPlaying) return; // Oyun oynanıyorsa yeni girişi engelle
  isRpsPlaying = true;

  // Arayüz Değişiklikleri
  document.getElementById('rps-stage-idle').classList.add('hidden');
  document.getElementById('rps-stage-battle').classList.remove('hidden');
  document.getElementById('rps-result-panel').classList.add('hidden'); // Sonucu sakla

  const playerHandDiv = document.getElementById('rps-battle-player');
  const computerHandDiv = document.getElementById('rps-battle-computer');
  const playerLabel = document.getElementById('rps-label-player');
  const computerLabel = document.getElementById('rps-label-computer');
  const countdownText = document.getElementById('rps-countdown-text');

  // Her ikisini de sallanan Taş yap (RPS ritmi)
  playerHandDiv.innerHTML = rpsSvgs.rock;
  computerHandDiv.innerHTML = rpsSvgs.rock;
  playerLabel.textContent = 'Sallanıyor...';
  computerLabel.textContent = 'Sallanıyor...';

  // Sallama Sınıflarını Ekle
  playerHandDiv.classList.add('animate-shake-player');
  computerHandDiv.classList.add('animate-shake-computer');

  // Geri sayım sayacını başlat
  countdownText.classList.remove('hidden');
  let countdownVal = 3;
  countdownText.textContent = countdownVal;
  
  const countdownInterval = setInterval(() => {
    countdownVal--;
    if (countdownVal > 0) {
      countdownText.textContent = countdownVal;
    } else {
      countdownText.textContent = 'AÇ!';
      clearInterval(countdownInterval);
    }
  }, 400);

  // 1.5 Saniye Sallanma Süresi
  setTimeout(() => {
    // Sallanmayı ve Geri Sayımı Durdur
    playerHandDiv.classList.remove('animate-shake-player');
    computerHandDiv.classList.remove('animate-shake-computer');
    countdownText.classList.add('hidden');

    // Bilgisayar hamlesini hesapla
    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    // Gerçek hamle görsellerini ata
    playerHandDiv.innerHTML = rpsSvgs[playerChoice];
    computerHandDiv.innerHTML = rpsSvgs[computerChoice];
    playerLabel.textContent = rpsNames[playerChoice];
    computerLabel.textContent = rpsNames[computerChoice];

    // Sonuç panelini göster
    const resultPanel = document.getElementById('rps-result-panel');
    const resultText = document.getElementById('rps-result-text');
    const resultSubtext = document.getElementById('rps-result-subtext');
    resultPanel.classList.remove('hidden');

    // Skor kıyaslama mantığı
    const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

    if (playerChoice === computerChoice) {
      rpsScores.draws++;
      rpsScores.streak = 0;
      resultText.textContent = 'BERABERE!';
      resultText.className = 'text-2xl font-bold text-slate-400 tracking-wide';
      resultSubtext.textContent = 'İki taraf da aynı hamleyi yaptı.';
    } else if (beats[playerChoice] === computerChoice) {
      rpsScores.player++;
      rpsScores.streak++;
      resultText.textContent = 'KAZANDIN!';
      resultText.className = 'text-2xl font-bold text-success-emerald tracking-wide';
      resultSubtext.textContent = `${rpsNames[playerChoice]} ${rpsNames[computerChoice].toLowerCase()} hamlesini yener.`;
      
      // Konfeti patlat
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });

      if (rpsScores.streak >= 3) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#facc15', '#06b6d4', '#10b981']
          });
        }, 200);
      }
    } else {
      rpsScores.computer++;
      rpsScores.streak = 0;
      resultText.textContent = 'KAYBETTİN!';
      resultText.className = 'text-2xl font-bold text-danger-crimson tracking-wide';
      resultSubtext.textContent = `${rpsNames[computerChoice]} ${rpsNames[playerChoice].toLowerCase()} hamlesini yener.`;
    }

    saveRpsScores();
    updateRpsUI();
    isRpsPlaying = false; // Yeni oyun için kilidi aç
  }, 1500);
}


// ==========================================
// 3. 3D ZAR ATMA OYUN MOTORU
// ==========================================

let diceStats = { rollCount: 0, totalValue: 0 };
let diceHistory = [];

function loadDiceStats() {
  const statsSaved = localStorage.getItem('blitzhub-dice-stats');
  const historySaved = localStorage.getItem('blitzhub-dice-history');

  if (statsSaved) diceStats = JSON.parse(statsSaved);
  if (historySaved) diceHistory = JSON.parse(historySaved);

  updateDiceStatsUI();
  updateDiceHistoryUI();
}

function saveDiceStats() {
  localStorage.setItem('blitzhub-dice-stats', JSON.stringify(diceStats));
  localStorage.setItem('blitzhub-dice-history', JSON.stringify(diceHistory));
}

function updateDiceStatsUI() {
  document.getElementById('dice-stat-count').textContent = diceStats.rollCount;
  const avg = diceStats.rollCount > 0 ? (diceStats.totalValue / diceStats.rollCount).toFixed(1) : '0.0';
  document.getElementById('dice-stat-average').textContent = avg;
}

function updateDiceHistoryUI() {
  const listContainer = document.getElementById('dice-history-list');
  if (diceHistory.length === 0) {
    listContainer.innerHTML = '<p class="text-slate-500 text-center py-4">Henüz zar atılmadı.</p>';
    return;
  }

  listContainer.innerHTML = diceHistory.map((item, index) => `
    <div class="flex items-center justify-between bg-slate-100 p-2 rounded-lg border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800/80">
      <span class="text-slate-500 font-semibold">${diceHistory.length - index}. Atış:</span>
      <div class="flex items-center gap-1.5">
        <span class="bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded font-bold mono-font">${item.dice.join(' + ')}</span>
        <span class="font-bold text-slate-700 dark:text-slate-350 mono-font">= ${item.total}</span>
      </div>
    </div>
  `).join('');
}

function clearDiceHistory() {
  diceHistory = [];
  diceStats = { rollCount: 0, totalValue: 0 };
  saveDiceStats();
  updateDiceStatsUI();
  updateDiceHistoryUI();
}

function renderDicePlaceholder(count) {
  const tabletop = document.getElementById('dice-tabletop');
  tabletop.innerHTML = '';
  
  for (let i = 0; i < count; i++) {
    const diceDiv = document.createElement('div');
    diceDiv.className = 'dice-scene';
    diceDiv.innerHTML = `
      <div class="dice show-1" id="dice-${i}">
        <div class="dice-face face-1"><div class="dice-dot"></div></div>
        <div class="dice-face face-2">
          <div class="dice-dot"></div><div class="dice-dot"></div>
        </div>
        <div class="dice-face face-3">
          <div class="dice-dot"></div><div class="dice-dot"></div><div class="dice-dot"></div>
        </div>
        <div class="dice-face face-4">
          <div class="dice-dot"></div><div class="dice-dot"></div>
          <div class="dice-dot"></div><div class="dice-dot"></div>
        </div>
        <div class="dice-face face-5">
          <div class="dice-dot"></div><div class="dice-dot"></div>
          <div class="dice-dot"></div><div class="dice-dot"></div>
          <div class="dice-dot"></div>
        </div>
        <div class="dice-face face-6">
          <div class="dice-dot"></div><div class="dice-dot"></div>
          <div class="dice-dot"></div><div class="dice-dot"></div>
          <div class="dice-dot"></div><div class="dice-dot"></div>
        </div>
      </div>
    `;
    tabletop.appendChild(diceDiv);
  }
}

function rollDice() {
  const diceCountSelect = document.getElementById('dice-count-select');
  const count = parseInt(diceCountSelect.value);
  const rollBtn = document.getElementById('roll-dice-btn');
  const totalPanel = document.getElementById('dice-total-panel');
  const totalValNode = document.getElementById('dice-total-value');

  // Butonu kilitle
  rollBtn.disabled = true;
  rollBtn.classList.remove('hover:bg-brand-gold-hover');
  rollBtn.classList.add('opacity-50', 'cursor-not-allowed');

  // Animasyonu Başlat
  const diceElements = [];
  for (let i = 0; i < count; i++) {
    const d = document.getElementById(`dice-${i}`);
    if (d) {
      d.className = 'dice rolling';
      diceElements.push(d);
    }
  }

  // 1 Saniye sonra durdur ve değer hesapla
  setTimeout(() => {
    let total = 0;
    const rolls = [];

    diceElements.forEach(d => {
      const value = Math.floor(Math.random() * 6) + 1;
      rolls.push(value);
      total += value;
      d.className = `dice show-${value}`;
    });

    totalValNode.textContent = total;
    totalPanel.classList.remove('hidden');

    diceStats.rollCount++;
    diceStats.totalValue += total;
    
    diceHistory.unshift({ dice: rolls, total: total });
    if (diceHistory.length > 15) diceHistory.pop();

    saveDiceStats();
    updateDiceStatsUI();
    updateDiceHistoryUI();

    // Buton kilidini kaldır
    rollBtn.disabled = false;
    rollBtn.classList.add('hover:bg-brand-gold-hover');
    rollBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    
    if (total === (count * 6)) {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#ffffff']
      });
    }
  }, 1000);
}


// ==========================================
// 4. ÇEKİLİŞ / RASTGELE SEÇİCİ MOTORU
// ==========================================

let participants = [];

function loadParticipants() {
  const saved = localStorage.getItem('blitzhub-participants');
  if (saved) {
    participants = JSON.parse(saved);
    renderParticipants();
  }
}

function saveParticipants() {
  localStorage.setItem('blitzhub-participants', JSON.stringify(participants));
}

function handleNameInputKey(event) {
  if (event.key === 'Enter') {
    addParticipant();
  }
}

function addParticipant() {
  const input = document.getElementById('raffle-name-input');
  const name = input.value.trim();
  
  if (name === '') return;
  if (participants.includes(name)) {
    alert('Bu isim zaten listede ekli!');
    return;
  }

  participants.push(name);
  input.value = '';
  input.focus();

  saveParticipants();
  renderParticipants();
}

function addBulkParticipants() {
  const area = document.getElementById('raffle-bulk-input');
  const content = area.value;
  if (!content.trim()) return;

  const names = content.split(/[\n,]+/)
    .map(n => n.trim())
    .filter(n => n.length > 0);

  let addedCount = 0;
  names.forEach(name => {
    if (!participants.includes(name)) {
      participants.push(name);
      addedCount++;
    }
  });

  area.value = '';
  
  if (addedCount > 0) {
    saveParticipants();
    renderParticipants();
  }
}

function removeParticipant(index) {
  participants.splice(index, 1);
  saveParticipants();
  renderParticipants();
}

function clearParticipants() {
  if (confirm('Tüm aday listesini silmek istediğinize emin misiniz?')) {
    participants = [];
    saveParticipants();
    renderParticipants();
  }
}

function renderParticipants() {
  const container = document.getElementById('participants-list');
  const countBadge = document.getElementById('participant-count-badge');
  
  countBadge.textContent = `${participants.length} Aday`;

  if (participants.length === 0) {
    container.innerHTML = '<span class="text-xs text-slate-500 w-full text-center py-2">Henüz kimse eklenmedi.</span>';
    return;
  }

  container.innerHTML = participants.map((name, index) => `
    <span class="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-200 dark:border-slate-700/60">
      <span>${name}</span>
      <button onclick="removeParticipant(${index})" class="text-slate-400 hover:text-danger-crimson cursor-pointer font-bold focus:outline-none transition-colors ml-0.5">&times;</button>
    </span>
  `).join('');
}

function drawRaffle() {
  const winnerInput = document.getElementById('winner-count');
  const backupInput = document.getElementById('backup-count');
  const winCount = Math.max(1, parseInt(winnerInput.value) || 1);
  const backCount = Math.max(0, parseInt(backupInput.value) || 0);

  if (participants.length < winCount) {
    alert(`Çekiliş yapabilmek için en az kazanan sayısı kadar (${winCount}) aday eklemelisiniz!`);
    return;
  }

  const drawBtn = document.getElementById('draw-btn');
  const stageIdle = document.getElementById('raffle-stage-idle');
  const stageShuffling = document.getElementById('raffle-stage-shuffling');
  const stageResults = document.getElementById('raffle-stage-results');
  const shuffleBox = document.getElementById('raffle-shuffle-box');

  // Arayüz kilidi
  drawBtn.disabled = true;
  drawBtn.classList.remove('hover:bg-brand-teal-hover');
  drawBtn.classList.add('opacity-50', 'cursor-not-allowed');
  
  stageIdle.classList.add('hidden');
  stageResults.classList.add('hidden');
  stageShuffling.classList.remove('hidden');

  // Karıştırma animasyonu
  let shuffleInterval = setInterval(() => {
    const randomName = participants[Math.floor(Math.random() * participants.length)];
    shuffleBox.textContent = randomName;
  }, 100);

  // 2 Saniye sonra kazananları açıkla
  setTimeout(() => {
    clearInterval(shuffleInterval);

    // Fisher-Yates Karıştırma
    const listCopy = [...participants];
    for (let i = listCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [listCopy[i], listCopy[j]] = [listCopy[j], listCopy[i]];
    }

    const winners = listCopy.slice(0, winCount);
    const backups = listCopy.slice(winCount, winCount + backCount);

    // UI'da kazananları yazdır
    const winnersOutput = document.getElementById('raffle-winners-output');
    winnersOutput.innerHTML = winners.map((w, idx) => `
      <div class="flex items-center gap-3 w-full bg-brand-gold/10 border border-brand-gold/30 p-2.5 rounded-xl justify-between animate-pulse">
        <div class="flex items-center gap-2">
          <span class="bg-brand-gold text-slate-950 rounded-lg w-6 h-6 flex items-center justify-center text-xs font-extrabold font-mono">${idx + 1}</span>
          <span class="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide">${w}</span>
        </div>
        <span class="text-[10px] bg-brand-gold/25 text-brand-gold border border-brand-gold/45 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">KAZANDI</span>
      </div>
    `).join('');

    // Yedekleri yazdır
    const backupsContainer = document.getElementById('raffle-backups-container');
    const backupsOutput = document.getElementById('raffle-backups-output');

    if (backups.length > 0) {
      backupsOutput.innerHTML = backups.map((b, idx) => `
        <span class="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold dark:bg-slate-900/60 dark:border-slate-800">
          <span class="text-slate-500 font-mono font-extrabold text-[10px]">${idx + 1}.Yedek:</span>
          <span class="font-bold text-slate-700 dark:text-slate-350">${b}</span>
        </span>
      `).join('');
      backupsContainer.classList.remove('hidden');
    } else {
      backupsContainer.classList.add('hidden');
    }

    stageShuffling.classList.add('hidden');
    stageResults.classList.remove('hidden');

    drawBtn.disabled = false;
    drawBtn.classList.add('hover:bg-brand-teal-hover');
    drawBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    triggerGiveawayConfetti();

  }, 2000);
}

function triggerGiveawayConfetti() {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#facc15', '#06b6d4']
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#facc15', '#06b6d4']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}
