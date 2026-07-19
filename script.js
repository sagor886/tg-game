const tg = window.Telegram.WebApp;
tg.expand();

// ডাটা লোড
let score = parseInt(localStorage.getItem('coins')) || 0;
let level = parseInt(localStorage.getItem('level')) || 1;
let coinsPerClick = level;

// ⚡ ২৪ ঘণ্টার এনার্জি লিমিট লজিক
const MAX_ENERGY = 500;
let currentEnergy = parseInt(localStorage.getItem('energy'));
let lastResetTime = localStorage.getItem('last_reset_time');
const now = Date.now();

// যদি ২৪ ঘণ্টা পার হয়ে যায় বা ডাটা না থাকে তবে ৫০০ এনার্জি রিসেট হবে
if (!lastResetTime || (now - parseInt(lastResetTime) > 24 * 60 * 60 * 1000)) {
    currentEnergy = MAX_ENERGY;
    localStorage.setItem('energy', currentEnergy);
    localStorage.setItem('last_reset_time', now);
} else if (isNaN(currentEnergy)) {
    currentEnergy = MAX_ENERGY;
}

// DOM Elements
const scoreEl = document.getElementById('score');
const walletBalanceEl = document.getElementById('wallet-balance');
const levelTextEl = document.getElementById('level-text');
const energyTextEl = document.getElementById('energy-text');
const energyBarEl = document.getElementById('energy-bar');
const clickBtn = document.getElementById('click-btn');
const boostBtn = document.getElementById('boost-btn');
const adBtn = document.getElementById('ad-btn');
const inviteBtn = document.getElementById('invite-btn');

const clickSound = document.getElementById('click-sound');
const levelSound = document.getElementById('level-sound');

function updateUI() {
    scoreEl.innerText = score;
    walletBalanceEl.innerText = `${score} Coins`;
    levelTextEl.innerText = `🏆 Level: ${level}`;
    boostBtn.innerText = `⚡ Upgrade Level (Cost: ${level * 50})`;
    
    // এনার্জি বার আপডেট
    energyTextEl.innerText = `${currentEnergy} / ${MAX_ENERGY}`;
    const energyPercentage = (currentEnergy / MAX_ENERGY) * 100;
    energyBarEl.style.width = `${energyPercentage}%`;
}
updateUI();

// ট্যাব পরিবর্তন
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
    updateUI();
}

// ট্যাপ বাটন ইভেন্ট (লিমিট চেকসহ)
clickBtn.addEventListener('click', (e) => {
    if (currentEnergy >= coinsPerClick) {
        score += coinsPerClick;
        currentEnergy -= coinsPerClick; // এনার্জি কমবে
        
        localStorage.setItem('coins', score);
        localStorage.setItem('energy', currentEnergy);
        
        updateUI();
        
        clickSound.currentTime = 0;
        clickSound.play().catch(()=>{});
        createFloatingText(e, `+${coinsPerClick}`);
    } else {
        alert("⚡ Out of energy! Limits reset every 24 hours.");
    }
});

function createFloatingText(e, text) {
    const floatText = document.createElement('div');
    floatText.className = 'float-text';
    floatText.innerText = text;
    const rect = clickBtn.getBoundingClientRect();
    floatText.style.left = `${e.clientX - rect.left - 10}px`;
    floatText.style.top = `${e.clientY - rect.top - 20}px`;
    clickBtn.appendChild(floatText);
    setTimeout(() => floatText.remove(), 600);
}

// লেভেল আপগ্রেড
boostBtn.addEventListener('click', () => {
    let upgradeCost = level * 50;
    if (score >= upgradeCost) {
        score -= upgradeCost;
        level++;
        coinsPerClick = level;
        localStorage.setItem('coins', score);
        localStorage.setItem('level', level);
        updateUI();
        levelSound.currentTime = 0;
        levelSound.play().catch(()=>{});
    } else {
        alert(`❌ Not enough coins! Need ${upgradeCost}.`);
    }
});

// বিজ্ঞাপন বাটন
adBtn.addEventListener('click', () => {
    tg.openLink('https://www.example.com/your-ad-link'); 
    score += 500;
    localStorage.setItem('coins', score);
    updateUI();
});

// 👥 ইউনিক ইনভাইট লিংক সেটআপ
inviteBtn.addEventListener('click', () => {
    const botUsername = "cr7game_bot"; // আপনার বটের ইউজারনেম
    const userId = tg.initDataUnsafe.user?.id || 'new_player';
    const referralLink = `https://t.me/${botUsername}?start=ref_${userId}`;
    const shareText = "🎮 Play this amazing Telegram game, tap to earn coins and cash out!";
    
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    tg.openTelegramLink(telegramShareUrl);
});
