// Telegram Web App Initialization
const tg = window.Telegram.WebApp;
tg.expand();

let score = parseInt(localStorage.getItem('coins')) || 0;
let level = parseInt(localStorage.getItem('level')) || 1;
let coinsPerClick = level; // লেভেল ১ হলে ১ কয়েন, লেভেল ২ হলে ২ কয়েন পাবেন

// DOM Elements
const scoreEl = document.getElementById('score');
const levelTextEl = document.getElementById('level-text');
const clickBtn = document.getElementById('click-btn');
const boostBtn = document.getElementById('boost-btn');
const adBtn = document.getElementById('ad-btn');
const inviteBtn = document.getElementById('invite-btn');

const clickSound = document.getElementById('click-sound');
const levelSound = document.getElementById('level-sound');

// Initial Setup Load
scoreEl.innerText = score;
levelTextEl.innerText = `🏆 Level: ${level}`;
updateBoostButtonText();

// 1. Tapping System with Sound & Animation
clickBtn.addEventListener('click', (e) => {
    score += coinsPerClick;
    scoreEl.innerText = score;
    localStorage.setItem('coins', score);

    // প্লে সাউন্ড
    clickSound.currentTime = 0;
    clickSound.play().catch(()=>{});

    // ফ্লোটিং টেক্সট অ্যানিমেশন তৈরি
    createFloatingText(e, `+${coinsPerClick}`);
});

function createFloatingText(e, text) {
    const floatText = document.createElement('div');
    floatText.className = 'float-text';
    floatText.innerText = text;
    
    // ক্লিকের পজিশন অনুযায়ী টেক্সট বসানো
    const rect = clickBtn.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const y = e.clientY - rect.top - 20;
    
    floatText.style.left = `${x}px`;
    floatText.style.top = `${y}px`;
    
    clickBtn.appendChild(floatText);
    
    // অ্যানিমেশন শেষে রিমুভ করা
    setTimeout(() => {
        floatText.remove();
    }, 600);
}

// 2. Level Upgrade System (Boost)
boostBtn.addEventListener('click', () => {
    let upgradeCost = level * 50; // লেভেল যত বাড়বে খরচ তত বাড়বে
    
    if (score >= upgradeCost) {
        score -= upgradeCost;
        level++;
        coinsPerClick = level;
        
        scoreEl.innerText = score;
        levelTextEl.innerText = `🏆 Level: ${level}`;
        
        localStorage.setItem('coins', score);
        localStorage.setItem('level', level);
        
        updateBoostButtonText();
        
        // লেভেল আপ সাউন্ড
        levelSound.currentTime = 0;
        levelSound.play().catch(()=>{});
        
        alert(`🎉 Awesome! Upgraded to Level ${level}. Now you get ${coinsPerClick} coins per tap!`);
    } else {
        alert(`❌ Not enough coins! You need ${upgradeCost} coins.`);
    }
});

function updateBoostButtonText() {
    boostBtn.innerText = `⚡ Upgrade Level (Cost: ${level * 50})`;
}

// 3. Watch Ads Button
adBtn.addEventListener('click', () => {
    // এখানে আপনার Monetag/Direct Link-এর অ্যাড বসিয়ে দিন
    tg.openLink('https://www.example.com/your-ad-link'); 
    
    // বোনাস অ্যাড করা
    score += 500;
    scoreEl.innerText = score;
    localStorage.setItem('coins', score);
});

// 4. Invite Friends Button
inviteBtn.addEventListener('click', () => {
    const botUsername = "cr7game_bot"; 
    const referralLink = `https://t.me/${botUsername}?start=ref_${tg.initDataUnsafe.user?.id || 'player'}`;
    const shareText = "🎮 Play & Earn Free Coins! 💰";
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    
    tg.openTelegramLink(telegramShareUrl);
});
