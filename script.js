// 1. Firebase Modules Import & Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBRIPJl700j0-v0FJPjQeIapnVQxHjd_oY",
    authDomain: "tg-game-d7a56.firebaseapp.com",
    projectId: "tg-game-d7a56",
    storageBucket: "tg-game-d7a56.firebasestorage.app",
    messagingSenderId: "1042867845549",
    appId: "1:1042867845549:web:39bfbb2b32ad8951680924",
    measurementId: "G-25DN521WZW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tg = window.Telegram.WebApp;
tg.expand();

// Telegram User Info
const userData = tg.initDataUnsafe.user || { id: "guest_player", first_name: "Guest Player" };
const userId = userData.id.toString();

let score = 0.0;
let level = 1;
let currentEnergy = 200;
const MAX_ENERGY = 200;
let lastGiftTime = 0;

const userRef = doc(db, "users", userId);

// 2. Load User Data from Firebase Database
async function loadUserData() {
    try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            score = data.score || 0.0;
            level = data.level || 1;
            currentEnergy = data.energy !== undefined ? data.energy : MAX_ENERGY;
            lastGiftTime = data.lastGiftTime || 0;
        } else {
            // New user registration in Firestore
            await setDoc(userRef, {
                name: userData.first_name,
                username: userData.username || "",
                score: 0.0,
                level: 1,
                energy: MAX_ENERGY,
                lastGiftTime: 0,
                joinedAt: new Date()
            });
        }
        updateUI();
    } catch (e) {
        console.error("Data Load Error:", e);
    }
}
loadUserData();

// 3. Sync to Firebase
async function syncToDatabase() {
    try {
        await updateDoc(userRef, {
            score: score,
            level: level,
            energy: currentEnergy,
            lastGiftTime: lastGiftTime
        });
    } catch (e) {
        console.error("Save Error:", e);
    }
}

// Auto Passive Income (+0.1 point per sec)
setInterval(() => {
    score += 0.1;
    updateUI();
}, 1000);

// Auto Sync data every 5 seconds to reduce server load
setInterval(() => {
    syncToDatabase();
}, 5000);

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

// Audio autoplay on tap
document.body.addEventListener('click', () => {
    const music = document.getElementById('bg-music');
    if (music && music.paused) {
        music.volume = 0.3;
        music.play().catch(()=>{});
    }
}, { once: true });

function updateUI() {
    if(scoreEl) scoreEl.innerText = score.toFixed(1);
    if (walletBalanceNumEl) walletBalanceNumEl.innerText = (score / 1000).toFixed(2);
    
    if(levelTextEl) levelTextEl.innerText = `🏆 Level: ${level}`;
    if(boostBtn) boostBtn.innerText = `⚡ Upgrade Level (Cost: ${level * 50})`;
    
    if(energyTextEl) energyTextEl.innerText = `${currentEnergy} / ${MAX_ENERGY}`;
    if(energyBarEl) energyBarEl.style.width = `${(currentEnergy / MAX_ENERGY) * 100}%`;

    // Gift Timer
    if (giftBtn) {
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
}

// Tap Event
clickBtn.addEventListener('click', (e) => {
    if (currentEnergy > 0) {
        score += level;
        currentEnergy -= 1;
        updateUI();
        
        if(clickSound) { clickSound.currentTime = 0; clickSound.play().catch(()=>{}); }
        createFloatingText(e, `+${level} 💰`);
    } else {
        alert("⚡ এনার্জি শেষ! পরবর্তী গিফট ক্লেম করুন।");
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

// Hourly Gift
giftBtn.addEventListener('click', () => {
    currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 10);
    lastGiftTime = Date.now();
    updateUI();
    syncToDatabase();
    alert("🎉 🌟 আপনি ১০ এনার্জি উপহার পেয়েছেন! 🌟 🎉");
});

// Watch Ad
adBtn.addEventListener('click', () => {
    tg.openLink('https://saking886.blogspot.com/p/news.html'); 
    currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 50);
    updateUI();
    syncToDatabase();
    alert("📺 ⚡ ৫০ এনার্জি যোগ করা হয়েছে! ⚡");
});

// Spin Modal
spinOpenBtn.addEventListener('click', () => spinModal.style.display = 'flex');
closeModal.addEventListener('click', () => spinModal.style.display = 'none');

spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    if (score < 99) { alert("❌ স্পিন করতে ৯৯ কয়েন লাগবে!"); return; }

    score -= 99;
    updateUI();
    isSpinning = true;
    
    const randomDegrees = Math.floor(Math.random() * 360) + 1800;
    wheel.style.transform = `rotate(${randomDegrees}deg)`;

    setTimeout(() => {
        isSpinning = false;
        const actualDegrees = randomDegrees % 360;
        let rewardText = "";
        
        if (actualDegrees >= 0 && actualDegrees < 45) { currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 10); rewardText = "🔟 ⚡ Energy"; }
        else if (actualDegrees >= 45 && actualDegrees < 90) { score += 20; rewardText = "2️⃣0️⃣ 💰 Coins"; }
        else if (actualDegrees >= 90 && actualDegrees < 135) { currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 40); rewardText = "4️⃣0️⃣ ⚡ Energy"; }
        else if (actualDegrees >= 135 && actualDegrees < 180) { score += 70; rewardText = "7️⃣0️⃣ 💰 Coins"; }
        else if (actualDegrees >= 180 && actualDegrees < 225) { currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 100); rewardText = "1️⃣0️⃣0️⃣ ⚡ Energy"; }
        else if (actualDegrees >= 225 && actualDegrees < 270) { score += 40; rewardText = "4️⃣0️⃣ 💰 Coins"; }
        else if (actualDegrees >= 270 && actualDegrees < 315) { currentEnergy = Math.min(MAX_ENERGY, currentEnergy + 500); rewardText = "5️⃣0️⃣0️⃣ ⚡ Energy"; }
        else { rewardText = "💥 Try Again!"; }

        updateUI();
        syncToDatabase();
        alert(`🎉 🎡 পুরস্কার: ${rewardText} 🎡 🎉`);
    }, 4000);
});

// Withdraw Request
confirmWithdrawBtn.addEventListener('click', async () => {
    let amountTk = parseFloat(withdrawAmountInput.value);
    let accountNo = accountNumInput.value.trim();

    if (isNaN(amountTk) || amountTk < 50 || (amountTk * 1000) > score) {
        alert("❌ সঠিক অ্যামাউন্ট দিন (সর্বনিম্ন ৫০ টাকা)!");
        return;
    }
    if (accountNo.length < 11) {
        alert("❌ সঠিক নম্বর দিন!");
        return;
    }

    score -= (amountTk * 1000);
    updateUI();
    await syncToDatabase();

    // Save Withdraw request for Admin Panel
    const withdrawRef = doc(db, "withdrawals", `${userId}_${Date.now()}`);
    await setDoc(withdrawRef, {
        userId: userId,
        userName: userData.first_name,
        method: selectedMethod,
        accountNo: accountNo,
        amountTk: amountTk,
        status: "Pending",
        time: new Date()
    });

    withdrawAmountInput.value = "";
    accountNumInput.value = "";
    alert(`✅ উইথড্র রিকোয়েস্ট অ্যাডমিনের কাছে পাঠানো হয়েছে!`);
});

// Invite Friend
inviteBtn.addEventListener('click', () => {
    const botUsername = "cr7game_bot";
    const referralLink = `https://t.me/${botUsername}?start=ref_${userId}`;
    const shareText = "🎮 Play & Earn via bKash/Nagad! ৩০০০ পয়েন্ট সংগ্রহ করলেই আমরা দুজনেই ১০০০ পয়েন্ট বোনাস পাবো! 🎁";
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`);
});

// Tabs System
window.selectMethod = function(method) {
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
};

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if(event) event.currentTarget.classList.add('active');
    updateUI();
};
