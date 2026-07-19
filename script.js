const tg = window.Telegram.WebApp;
tg.expand();

// ডাটা লোড
let score = parseInt(localStorage.getItem('coins')) || 0;
let level = parseInt(localStorage.getItem('level')) || 1;
let coinsPerClick = level;

// ⚡ ২৪ ঘণ্টার ট্যাপ লিমিট লজিক (সর্বোচ্চ ২০০ বার ট্যাপ করা যাবে)
const MAX_ENERGY = 200; 
let currentEnergy = localStorage.getItem('energy') !== null ? parseInt(localStorage.getItem('energy')) : MAX_ENERGY;
let lastResetTime = localStorage.getItem('last_reset_time');
const now = Date.now();

// ২৪ ঘণ্টা পর ট্যাপ লিমিট আবার ২০০ হবে
if (!lastResetTime || (now - parseInt(lastResetTime) > 24 * 60 * 60 * 1000)) {
    currentEnergy = MAX_ENERGY;
    localStorage.setItem('energy', currentEnergy);
    localStorage.setItem('last_reset_time', now);
}

// DOM Elements
const scoreEl = document.getElementById('score');
const walletBalanceNumEl = document.getElementById('wallet-balance-num');
const levelTextEl = document.getElementById('level-text');
const energyTextEl = document.getElementById('energy-text');
const energyBarEl = document.getElementById('energy-bar');
const clickBtn = document.getElementById('click-btn');
const boostBtn = document.getElementById('boost-btn');
const adBtn = document.getElementById('ad-btn');
const inviteBtn = document.getElementById('invite-btn');

const withdrawAmountInput = document.getElementById('withdraw-amount');
const accountNumInput = document.getElementById('account-number');
const chargeText = document.getElementById('charge-text');
const receiveText = document.getElementById('receive-text');
const confirmWithdrawBtn = document.getElementById('confirm-withdraw-btn');
const methodLabel = document.getElementById('selected-method-label');

const clickSound = document.getElementById('click-sound');
const levelSound = document.getElementById('level-sound');

let selectedMethod = "Nagad";

function updateUI() {
    scoreEl.innerText = score;
    // 🪙 ১০০০ কয়েন = ১ টাকা কনভার্সন রেট
    let money = score / 1000;
    if (walletBalanceNumEl) {
        walletBalanceNumEl.innerText = money.toFixed(2);
    }
    
    levelTextEl.innerText = `🏆 Level: ${level}`;
    boostBtn.innerText = `⚡ Upgrade Level (Cost: ${level * 50})`;
    
    // ট্যাপ এনার্জি বার আপডেট
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
    if(event) event.currentTarget.classList.add('active');
    updateUI();
}

// ট্যাপ বাটন ইভেন্ট (শুধু ট্যাপ লিমিট কমবে, কিন্তু অন্যান্য ইনকামে বাধা নেই)
clickBtn.addEventListener('click', (e) => {
    if (currentEnergy > 0) {
        score += coinsPerClick; // লেভেল অনুযায়ী কয়েন ইনকাম
        currentEnergy -= 1;     // প্রতি ক্লিকে ১ এনার্জি কমবে (সর্বোচ্চ ২০০ ক্লিক)
        
        localStorage.setItem('coins', score);
        localStorage.setItem('energy', currentEnergy);
        
        updateUI();
        
        clickSound.currentTime = 0;
        clickSound.play().catch(()=>{});
        createFloatingText(e, `+${coinsPerClick}`);
    } else {
        alert("⚡ Today's 200 taps limit reached! Taps reset every 24 hours. (But you can still earn from Ads/Tasks)");
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

// পেমেন্ট মেথড সিলেক্ট লজিক (বিকাশ / নগদ)
function selectMethod(method) {
    selectedMethod = method;
    methodLabel.innerText = method;
    
    document.getElementById('method-nagad').classList.remove('active');
    document.getElementById('method-bkash').classList.remove('active');
    document.getElementById('nagad-check').style.display = 'none';
    document.getElementById('bkash-check').style.display = 'none';
    
    if(method === 'Nagad') {
        document.getElementById('method-nagad').classList.add('active');
        document.getElementById('nagad-check').style.display = 'block';
    } else {
        document.getElementById('method-bkash').classList.add('active');
        document.getElementById('bkash-check').style.display = 'block';
    }
}

// উইথড্র লাইভ ক্যালকুলেটর (টাকা ইনপুট দিলে চার্জ ও রিসিভ হিসাব হবে)
withdrawAmountInput.addEventListener('input', () => {
    let amountTk = parseFloat(withdrawAmountInput.value) || 0;
    let chargeTk = amountTk * 0.20; // ২০% চার্জ
    let finalReceiveTk = amountTk - chargeTk;
    if (finalReceiveTk < 0) finalReceiveTk = 0;

    chargeText.innerText = `৳${chargeTk.toFixed(2)}`;
    receiveText.innerText = `৳${finalReceiveTk.toFixed(2)}`;
});

// উইথড্র কনফার্ম
confirmWithdrawBtn.addEventListener('click', () => {
    let amountTk = parseFloat(withdrawAmountInput.value);
    let accountNo = accountNumInput.value.trim();
    let userBalanceTk = score / 1000;

    if (isNaN(amountTk) || amountTk < 50) {
        alert("❌ সর্বনিম্ন উইথড্র ৫০ টাকা!");
        return;
    }
    if (amountTk > userBalanceTk) {
        alert("❌ আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!");
        return;
    }
    if (accountNo.length < 11) {
        alert(`❌ অনুগ্রহ করে সঠিক ${selectedMethod} নম্বর দিন!`);
        return;
    }

    // সমপরিমাণ কয়েন কাটা (৳১ = ১০০০ কয়েন)
    let coinsToDeduct = amountTk * 1000;
    score -= coinsToDeduct;
    localStorage.setItem('coins', score);
    updateUI();

    // রিসেট ফর্ম
    withdrawAmountInput.value = "";
    accountNumInput.value = "";
    document.getElementById('account-name').value = "";
    chargeText.innerText = `৳০.০০`;
    receiveText.innerText = `৳০.০০`;

    alert(`✅ উইথড্র রিকোয়েস্ট সফল হয়েছে!\n৳${amountTk} আপনার ${selectedMethod} নম্বর (${accountNo})-এ প্রসেসিং করা হচ্ছে।`);
});

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

// বিজ্ঞাপন দেখে আনলিমিটেড কয়েন ইনকাম (ট্যাপ লিমিটের বাইরে)
adBtn.addEventListener('click', () => {
    tg.openLink('https://www.example.com/your-ad-link'); 
    score += 500;
    localStorage.setItem('coins', score);
    updateUI();
});

// 👥 ইউনিক ইনভাইট লিংক সেটআপ
inviteBtn.addEventListener('click', () => {
    const botUsername = "cr7game_bot"; // আপনার বটের ইউজারনেমটি এখানে বসাবেন
    const userId = tg.initDataUnsafe.user?.id || 'new_player';
    const referralLink = `https://t.me/${botUsername}?start=ref_${userId}`;
    const shareText = "🎮 Play this amazing Telegram game, tap to earn coins and cash out via bKash/Nagad!";
    
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    tg.openTelegramLink(telegramShareUrl);
});
