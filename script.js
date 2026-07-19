// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // পুরো স্ক্রিন জুড়ে অ্যাপটি ওপেন হবে

let coinCount = 0;
const balanceEl = document.getElementById('balance');
const coinBtn = document.getElementById('tap-coin');
const watchAdBtn = document.getElementById('watch-ad-btn');
const withdrawBtn = document.getElementById('withdraw-btn');

// ১. কয়েন ট্যাপ করার লজিক
coinBtn.addEventListener('click', () => {
    coinCount += 1; // প্রতি ক্লিকে ১ কয়েন করে বাড়বে
    balanceEl.innerText = coinCount;
    
    // মোবাইল ফোনে ভাইব্রেশন বা হ্যাপটিক ফিডব্যাক দেবে
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
});

// ২. অ্যাড দেখে ইনকাম করার লজিক (Adsterra/Monetag Direct Link)
watchAdBtn.addEventListener('click', () => {
    // নিচে "YOUR_AD_LINK_HERE" লেখা জায়গায় আপনার অ্যাড নেটওয়ার্কের লিংকটি বসিয়ে দিন
    const adLink = "https://www.example.com/your-direct-ad-link"; 
    
    // ইউজারের ফোনে নিউ ট্যাবে অ্যাড ওপেন হবে
    window.open(adLink, '_blank');
    
    // অ্যাড লিংকে ক্লিক করার কারণে ইউজারকে ৫০ কয়েন বোনাস দেওয়া হলো
    setTimeout(() => {
        coinCount += 50;
        balanceEl.innerText = coinCount;
        alert("Congratulations! You earned 50 bonus coins for watching the ad.");
    }, 2000);
});

// ৩. উইথড্র বাটন
withdrawBtn.addEventListener('click', () => {
    if(coinCount < 1000) {
        alert("Minimum withdraw limit is 1000 coins!");
    } else {
        alert("Please send a message to the bot with your balance to withdraw.");
        // বটের কাছে ডাটা ব্যাক পাঠানোর জন্য
        tg.sendData(JSON.stringify({action: "withdraw", amount: coinCount}));
    }
});
