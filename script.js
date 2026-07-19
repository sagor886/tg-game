const tg = window.Telegram.WebApp;
tg.expand();

// ডাটা লোড
let score = parseFloat(localStorage.getItem('coins')) || 0.0;
let level = parseInt(localStorage.getItem('level')) || 1;
let coinsPerClick = level;

// ⚡ ২৪ ঘণ্টার ট্যাপ লিমিট লজিক (সর্বোচ্চ ২০০ বার ট্যাপ)
const MAX_ENERGY = 200; 
let currentEnergy = localStorage.getItem('energy') !== null ? parseInt(localStorage.getItem('energy')) : MAX_ENERGY;
let lastResetTime = localStorage.getItem('last_reset_time') || Date.now();

// 🎁 ঘণ্টাভিত্তিক গিফট ক্লেম লজিক
let lastGiftTime = localStorage.getItem('last_gift_time') || 0;

// ⏳ প্রতি সেকেন্ডে ০.১ পয়েন্ট অটো বাড়ার প্রসেস
setInterval(() => {
    score += 0.1;
    localStorage.setItem('coins', score);
    updateUI();
}, 1000);

// মিউজিক অটো চালু করার জন্য প্রথম ক্লিকের অপেক্ষা
document.body.addEventListener('click', () => {
    const music = document.getElementById('bg-music');
    if (music.paused) {
        music.volume = 0.3; // রিল্যাক্সিং সাউন্ড লেভেল
        music.play().catch(()=>{});
    }
}, { once: true });

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
const giftBtn = document.getElementById('gift-btn');

const spinOpenBtn = document.getElementById('spin-open-btn');
const spinModal = document.getElementById('spin-modal');
const closeModal = document.getElementById('close-modal');
const spinBtn = document.getElementById('spin-btn');
const wheel = document.getElementById('wheel');

const withdrawAmountInput = document.getElementById('withdraw-amount');
const accountNumInput = document.getElementById('account-number');
const chargeText = document.getElementById('charge-text');
const receiveText = document.getElementById('receive-text');
const confirmWithdrawBtn = document.getElementById('confirm-withdraw-btn');
const methodLabel = document.getElementById('selected-method-label');

const clickSound = document.getElementById('click-sound');
const levelSound = document.getElementById('level-sound');

let selectedMethod = "Nagad";
let isSpinning = false;

function updateUI() {
    scoreEl.innerText = score.toFixed(1);
    let money = score / 1000;
    if (walletBalanceNumEl) walletBalanceNumEl.innerText = money.toFixed(2);
    
    levelTextEl.innerText = `🏆 Level: ${level}`;
    boostBtn.innerText = `⚡ Upgrade Level (Cost: ${level * 50})`;
    
    energyTextEl.innerText = `${currentEnergy} / ${MAX_ENERGY}`;
    const energyPercentage = (currentEnergy / MAX_ENERGY) * 100;
    energyBarEl.style.width = `${energyPercentage}%`;

    // গিফট বাটনের লাইভ টাইমার আপডেট
    const timePassed = Date.now() - parseInt(lastGiftTime);
    if (timePassed < 60 * 60 * 1000) {
        let remaining = Math.ceil((60 * 60 * 1000 - timePassed) / 1000 / 60);
        giftBtn.innerText = `⏳ Gift Ready in ${remaining}m`;
        giftBtn.disabled = true;
        giftBtn.style.opacity = "0.6";
    } else {
        giftBtn.innerText = "🎁 Claim Hourly Gift (+10 ⚡)";
        giftBtn.disabled = false;
        giftBtn.style.opacity = "1";
    }
}

// ঘণ্টাভিত্তিক গিফট ক্লেম বাটন ইভেন্ট
giftBtn.addEventListener('click', () => {
    currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 10);
    lastGiftTime = Date.now();
    localStorage.setItem('energy', currentEnergy);
    localStorage.setItem('last_gift_time', lastGiftTime);
    updateUI();
    alert("🎉 🌟 আপনি উপহার হিসেবে ১০ এনার্জি পেয়েছেন! 🌟 🎉");
});

// ট্যাপ বাটন ইভেন্ট
clickBtn.addEventListener('click', (e) => {
    if (currentEnergy > 0) {
        score += coinsPerClick;
        currentEnergy -= 1;
        
        localStorage.setItem('coins', score);
        localStorage.setItem('energy', currentEnergy);
        updateUI();
        
        clickSound.currentTime = 0;
        clickSound.play().catch(()=>{});
        createFloatingText(e, `+${coinsPerClick} 💰`);
    } else {
        alert("⚡ এনার্জি শেষ! পরবর্তী গিফট ক্লেম করুন অথবা ২৪ ঘণ্টা অপেক্ষা করুন।");
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

// 📺 বিজ্ঞাপন দেখে ৫০ এনার্জি লাভ
adBtn.addEventListener('click', () => {
    tg.openLink('https://saking886.blogspot.com/p/news.html'); 
    currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 50);
    localStorage.setItem('energy', currentEnergy);
    updateUI();
    alert("📺 ⚡ বিজ্ঞাপন দেখার জন্য ৫০ এনার্জি যোগ করা হয়েছে! ⚡ 📺");
});

// 🎡 স্পিন হুইল মডাল কন্ট্রোল
spinOpenBtn.addEventListener('click', () => spinModal.style.display = 'flex');
closeModal.addEventListener('click', () => spinModal.style.display = 'none');

// 🚀 লকি স্পিন হুইল গেম প্রসেস
spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    if (score < 99) {
        alert("❌ স্পিন করতে নূন্যতম ৯৯ কয়েন প্রয়োজন!");
        return;
    }

    score -= 99;
    localStorage.setItem('coins', score);
    updateUI();

    isSpinning = true;
    const randomDegrees = Math.floor(Math.random() * 360) + 1800; // নূন্যতম ৫ বার চাকা ঘুরবে
    wheel.style.transform = `rotate(${randomDegrees}deg)`;

    setTimeout(() => {
        isSpinning = false;
        const actualDegrees = randomDegrees % 360;
        let rewardText = "";
        
        // ৮টি ভিন্ন ভিন্ন সেগমেন্টের পুরস্কার নির্বাচন
        if (actualDegrees >= 0 && actualDegrees < 45) { currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 10); rewardText = "🔟 ⚡ Energy"; }
        else if (actualDegrees >= 45 && actualDegrees < 90) { score += 20; rewardText = "2️⃣0️⃣ 💰 Coins"; }
        else if (actualDegrees >= 90 && actualDegrees < 135) { currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 40); rewardText = "4️⃣0️⃣ ⚡ Energy"; }
        else if (actualDegrees >= 135 && actualDegrees < 180) { score += 70; rewardText = "7️⃣0️⃣ 💰 Coins"; }
        else if (actualDegrees >= 180 && actualDegrees < 225) { currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 100); rewardText = "1️⃣0️⃣0️⃣ ⚡ Energy"; }
        else if (actualDegrees >= 225 && actualDegrees < 270) { score += 40; rewardText = "4️⃣0️⃣ 💰 Coins"; }
        else if (actualDegrees >= 270 && actualDegrees < 315) { currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 500); rewardText = "5️⃣0️⃣0️⃣ ⚡ Energy"; }
        else { rewardText = "💥 Try Again Next Time!"; }

        localStorage.setItem('coins', score);
        localStorage.setItem('energy', currentEnergy);
        updateUI();

        alert(`🎉 🎡 লাকি স্পিন পুরস্কার: ${rewardText} 🎡 🎉`);
    }, 4000);
});

// 👥 রেফারেল সিস্টেম (৩০০০ পয়েন্ট শর্ত)
inviteBtn.addEventListener('click', () => {
    const botUsername = "cr7game_bot";
    const userId = tg.initDataUnsafe.user?.id || 'player';
    const referralLink = `https://t.me/${botUsername}?start=ref_${userId}`;
    const shareText = "🎮 Play & Earn via bKash/Nagad! ৩০০০ পয়েন্ট সংগ্রহ করলেই আমরা দুজনেই ১০০০ পয়েন্ট ফ্রি বোনাস পাবো! 🎁 💰";
    
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`);
});

// পেমেন্ট ও বাকি ইন্টারফেস কন্ট্রোল
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

withdrawAmountInput.addEventListener('input', () => {
    let amountTk = parseFloat(withdrawAmountInput.value) || 0;
    chargeText.innerText = `৳${(amountTk * 0.20).toFixed(2)}`;
    receiveText.innerText = `৳${(amountTk * 0.80).toFixed(2)}`;
});

confirmWithdrawBtn.addEventListener('click', () => {
    let amountTk = parseFloat(withdrawAmountInput.value);
    let accountNo = accountNumInput.value.trim();
    if (isNaN(amountTk) || amountTk < 50 || (amountTk * 1000) > score) { alert("❌ সঠিক অ্যামাউন্ট দিন (সর্বনিম্ন ৫০ টাকা)!"); return; }
    if (accountNo.length < 11) { alert("❌ সঠিক নম্বর দিন!"); return; }
    score -= (amountTk * 1000);
    localStorage.setItem('coins', score);
    updateUI();
    alert(`✅ উইথড্র সফল হয়েছে! ৳${amountTk} প্রসেসিংয়ে আছে।`);
});

boostBtn.addEventListener('click', () => {
    let cost = level * 50;
    if (score >= cost) { score -= cost; level++; coinsPerClick = level; localStorage.setItem('coins', score); localStorage.setItem('level', level); updateUI(); levelSound.play().catch(()=>{}); }
    else { alert("❌ পর্যাপ্ত কয়েন নেই!"); }
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if(event) event.currentTarget.classList.add('active');
    updateUI();
}
