/* =====================================================
   HEALTH TRACKER WITH SUPABASE AUTH
===================================================== */

const supabaseUrl = "https://jdestfitkftlcswkugbi.supabase.co";
const supabaseKey = "sb_publishable_Ll0WBClWb5OKYjcoBi6-4w_z7bV3qa3";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let healthData = [];
let currentUser = null;

/* =====================================================
   DOM ELEMENTS
===================================================== */
const form = document.getElementById("healthForm");
const inputPage = document.getElementById("inputPage");
const resultsPage = document.getElementById("resultsPage");
const dateInput = document.getElementById("date");
const readingInput = document.getElementById("reading");
const exerciseInput = document.getElementById("exercise");
const exerciseTypeInput = document.getElementById("exerciseType");
const customExerciseGroup = document.getElementById("customExerciseGroup");
const customExerciseInput = document.getElementById("customExercise");
const scoreInput = document.getElementById("score");
const scoreValue = document.getElementById("scoreValue");
const savedMessage = document.getElementById("savedMessage");
const showResultsButton = document.getElementById("showResultsButton");
const backToInputButton = document.getElementById("backToInputButton");
const clearAllButton = document.getElementById("clearAllButton");
const moodTracker = document.getElementById("moodTracker");
const historyList = document.getElementById("historyList");
const calendarDays = document.getElementById("calendarDays");
const calendarTitle = document.getElementById("calendarTitle");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

// Auth DOMs
const authModal = document.getElementById("authModal");
const authNavBtn = document.getElementById("authNavBtn");
const userStatusText = document.getElementById("userStatus");
const closeAuthModal = document.getElementById("closeAuthModal");
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

/* =====================================================
   MOOD CONFIG & CALENDAR STATE
===================================================== */
const moodConfig = {
    "เศร้า": { emoji: "😢", bulbClass: "bulb-sad", calendarClass: "mood-sad" },
    "เหนื่อย": { emoji: "😮‍💨", bulbClass: "bulb-tired", calendarClass: "mood-tired" },
    "เฉยๆ": { emoji: "😐", bulbClass: "bulb-normal", calendarClass: "mood-normal" },
    "ดี": { emoji: "🙂", bulbClass: "bulb-good", calendarClass: "mood-good" },
    "ดีมาก": { emoji: "🥰", bulbClass: "bulb-great", calendarClass: "mood-great" }
};

const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const now = new Date();
let calendarYear = now.getFullYear();
let calendarMonth = now.getMonth();

/* =====================================================
   AUTHENTICATION LOGIC
===================================================== */
authNavBtn.addEventListener("click", () => {
    if (currentUser) {
        supabaseClient.auth.signOut();
    } else {
        authModal.classList.remove("hidden");
    }
});

closeAuthModal.addEventListener("click", () => authModal.classList.add("hidden"));

tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
});

tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
});

// Register
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        alert("เกิดข้อผิดพลาดในการสมัครสมาชิก: " + error.message);
    } else {
        alert("สมัครสมาชิกสำเร็จเรียบร้อย! 💕");
        authModal.classList.add("hidden");
    }
});

// Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง 🥺");
    } else {
        alert("เข้าสู่ระบบเรียบร้อยแล้ว ✨");
        authModal.classList.add("hidden");
    }
});

// Check Auth State Change
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
        currentUser = session.user;
        userStatusText.textContent = `🌸 ${currentUser.email.split('@')[0]}`;
        authNavBtn.textContent = "ออกจากระบบ";
        fetchHealthData();
    } else {
        currentUser = null;
        userStatusText.textContent = "ยังไม่ได้เข้าสู่ระบบ";
        authNavBtn.textContent = "เข้าสู่ระบบ 💗";
        healthData = [];
        renderResults();
    }
});

/* =====================================================
   FETCH DATA FROM SUPABASE
===================================================== */
async function fetchHealthData() {
    if (!currentUser) return;

    const { data, error } = await supabaseClient
        .from("daily_logs")
        .select("*");

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    healthData = data.map(item => ({
        id: item.id,
        date: item.date,
        mood: item.mood,
        reading: item.reading || 0,
        exercise: item.exercise || 0,
        exerciseType: item.exercise_type || "ไม่ได้ออกกำลังกาย",
        score: item.score || 5
    }));

    renderResults();
}

/* =====================================================
   HELPERS & UTILS
===================================================== */
scoreInput.addEventListener("input", () => scoreValue.textContent = scoreInput.value);

exerciseTypeInput.addEventListener("change", () => {
    if (exerciseTypeInput.value === "อื่น ๆ") {
        customExerciseGroup.classList.add("show");
        customExerciseInput.required = true;
        customExerciseInput.focus();
    } else {
        customExerciseGroup.classList.remove("show");
        customExerciseInput.required = false;
        customExerciseInput.value = "";
    }
});

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

function getSortedData() {
    return [...healthData].sort((a, b) => a.date.localeCompare(b.date));
}

function getDataByDate(dateString) {
    return healthData.find(item => item.date === dateString);
}

/* =====================================================
   FORM SUBMIT (SAVE / UPDATE)
===================================================== */
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูลนะครับ 💗");
        authModal.classList.remove("hidden");
        return;
    }

    const date = dateInput.value;
    const mood = document.querySelector('input[name="mood"]:checked')?.value;
    const reading = Number(readingInput.value);
    const exercise = Number(exerciseInput.value);
    const selectedExercise = exerciseTypeInput.value;

    let exerciseType = selectedExercise;
    if (selectedExercise === "อื่น ๆ") {
        const customValue = customExerciseInput.value.trim();
        if (!customValue) {
            alert("กรุณาพิมพ์ประเภทการออกกำลังกายด้วยนะ 🌷");
            customExerciseInput.focus();
            return;
        }
        exerciseType = customValue;
    }

    const score = Number(scoreInput.value);

    // 1. ตรวจสอบว่าวันที่บันทึกนี้ เคยมีข้อมูลอยู่แล้วหรือไม่
    const existingData = getDataByDate(date);

    // 2. สร้างโครงสร้างข้อมูลสำหรับบันทึก
    const payload = {
        user_id: currentUser.id,
        date: date,
        mood: mood,
        note: "",
        reading: reading,
        exercise: exercise,
        exercise_type: exerciseType,
        score: score
    };

    // ถ้าเคยบันทึกวันเดียวกันไปแล้ว ให้ส่ง id เดิมไปด้วย เพื่อสั่งให้อัปเดตข้อมูลแถวเดิม
    if (existingData && existingData.id) {
        payload.id = existingData.id;
    }

    // Save / Update to Supabase
    try {
        const { data, error } = await supabaseClient
            .from("daily_logs")
            .upsert(payload);

        if (error) {
            alert("บันทึกไม่สำเร็จ: " + error.message);
            return;
        }

        alert("บันทึกข้อมูลเรียบร้อยแล้ว 🌷");
        await fetchHealthData();

        savedMessage.classList.add("show");
        savedMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
        console.error("Fetch Error:", err);
    }
});

/* =====================================================
   NAVIGATION
===================================================== */
showResultsButton.addEventListener("click", () => {
    inputPage.classList.add("hidden");
    resultsPage.classList.remove("hidden");
    renderResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

backToInputButton.addEventListener("click", () => {
    resultsPage.classList.add("hidden");
    inputPage.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* =====================================================
   CALENDAR
===================================================== */
function renderCalendar() {
    calendarDays.innerHTML = "";
    calendarTitle.textContent = `${thaiMonths[calendarMonth]} ${calendarYear + 543}`;

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        calendarDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";

        const monthString = String(calendarMonth + 1).padStart(2, "0");
        const dayString = String(day).padStart(2, "0");
        const dateString = `${calendarYear}-${monthString}-${dayString}`;

        const data = getDataByDate(dateString);

        if (dateString === getTodayString()) button.classList.add("today");

        if (data) {
            const config = moodConfig[data.mood];
            button.classList.add("has-data");
            if (config) button.classList.add(config.calendarClass);
            button.title = `บันทึกแล้ว: ${data.mood}`;
        }

        button.textContent = day;

        button.addEventListener("click", () => {
            resultsPage.classList.add("hidden");
            inputPage.classList.remove("hidden");
            dateInput.value = dateString;
            loadDataToForm(dateString);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        calendarDays.appendChild(button);
    }
}

prevMonthButton.addEventListener("click", () => {
    calendarMonth--;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
    calendarMonth++;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    renderCalendar();
});

function loadDataToForm(dateString) {
    const data = getDataByDate(dateString);

    document.querySelectorAll('input[name="mood"]').forEach(radio => radio.checked = false);

    if (!data) {
        readingInput.value = "";
        exerciseInput.value = "";
        exerciseTypeInput.value = "ไม่ได้ออกกำลังกาย";
        customExerciseInput.value = "";
        customExerciseInput.required = false;
        customExerciseGroup.classList.remove("show");
        scoreInput.value = 5;
        scoreValue.textContent = 5;
        return;
    }

    const moodRadio = document.querySelector(`input[name="mood"][value="${data.mood}"]`);
    if (moodRadio) moodRadio.checked = true;

    readingInput.value = data.reading;
    exerciseInput.value = data.exercise;

    const options = Array.from(exerciseTypeInput.options);
    const predefined = options.some(option => option.value === data.exerciseType);

    if (predefined) {
        exerciseTypeInput.value = data.exerciseType;
        customExerciseGroup.classList.remove("show");
        customExerciseInput.value = "";
        customExerciseInput.required = false;
    } else {
        exerciseTypeInput.value = "อื่น ๆ";
        customExerciseGroup.classList.add("show");
        customExerciseInput.value = data.exerciseType;
        customExerciseInput.required = true;
    }

    scoreInput.value = data.score;
    scoreValue.textContent = data.score;
}

/* =====================================================
   MOOD TRACKER & HISTORY
===================================================== */
function renderMoodTracker() {
    moodTracker.innerHTML = "";
    const data = getSortedData();

    if (data.length === 0) {
        moodTracker.innerHTML = `<div class="empty-state">ยังไม่มีข้อมูล ลองบันทึกวันแรกดูนะ 🌱</div>`;
        return;
    }

    data.forEach(item => {
        const config = moodConfig[item.mood];
        const moodDay = document.createElement("div");
        moodDay.className = "mood-day";
        moodDay.innerHTML = `
            <div class="mood-bulb ${config ? config.bulbClass : ''}" title="${item.mood}">
                ${config ? config.emoji : '😐'}
            </div>
            <div class="mood-day-date">${formatDate(item.date)}</div>
            <div class="mood-day-name">${item.mood}</div>
        `;
        moodTracker.appendChild(moodDay);
    });
}

function renderHistory() {
    historyList.innerHTML = "";
    const data = getSortedData().reverse();

    if (data.length === 0) {
        historyList.innerHTML = `<div class="empty-state">ยังไม่มีบันทึก 🌷</div>`;
        return;
    }

    data.forEach(item => {
        const config = moodConfig[item.mood];
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const exerciseText = item.exercise > 0
            ? `🏃 ${item.exercise} นาที (${item.exerciseType})`
            : `🏃 ${item.exercise} นาที`;

        historyItem.innerHTML = `
            <div class="history-date">📅 ${formatDate(item.date)}</div>
            <div class="history-mood">${config ? config.emoji : '😐'} ${item.mood}</div>
            <div class="history-info">📚 ${item.reading} นาที<br>${exerciseText}</div>
            <div class="history-score">⭐ ${item.score}/10</div>
            <button class="delete-button" onclick="deleteData(${item.id})">🗑️</button>
        `;
        historyList.appendChild(historyItem);
    });
}

/* =====================================================
   DELETE DATA (SUPABASE)
===================================================== */
async function deleteData(id) {
    const confirmed = confirm("ต้องการลบข้อมูลวันนี้ใช่ไหม? 🥺");
    if (!confirmed) return;

    const { error } = await supabaseClient
        .from("daily_logs")
        .delete()
        .eq("id", id);

    if (error) {
        alert("ลบข้อมูลไม่สำเร็จ: " + error.message);
    } else {
        await fetchHealthData();
    }
}

clearAllButton.addEventListener("click", async () => {
    if (healthData.length === 0) {
        alert("ตอนนี้ยังไม่มีข้อมูลให้ลบนะ 🌱");
        return;
    }

    const confirmed = confirm("ต้องการล้างข้อมูลทั้งหมดจริง ๆ ใช่ไหม?\n\nข้อมูลทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้ 🥺");
    if (!confirmed) return;

    const { error } = await supabaseClient
        .from("daily_logs")
        .delete()
        .eq("user_id", currentUser.id);

    if (error) {
        alert("ล้างข้อมูลไม่สำเร็จ: " + error.message);
    } else {
        await fetchHealthData();
        alert("ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว 🌷");
    }
});

/* =====================================================
   CHARTS
===================================================== */
let activityChart = null;
function renderActivityChart() {
    const canvas = document.getElementById("activityChart");
    const data = getSortedData();

    const labels = data.map(item => formatDate(item.date).substring(0, 5));
    const readingData = data.map(item => item.reading);
    const exerciseData = data.map(item => item.exercise);

    if (activityChart) activityChart.destroy();

    activityChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                { label: "อ่านหนังสือ 📚", data: readingData, backgroundColor: "#c8b5ed", borderRadius: 10 },
                { label: "ออกกำลังกาย 🏃", data: exerciseData, backgroundColor: "#a9d8bd", borderRadius: 10 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { font: { family: "Kanit" } } } },
            scales: { x: { grid: { display: false } }, y: { beginAtZero: true, title: { display: true, text: "นาที" } } }
        }
    });
}

let scoreChart = null;
function renderScoreChart() {
    const canvas = document.getElementById("scoreChart");
    const data = getSortedData();

    const labels = data.map(item => formatDate(item.date).substring(0, 5));
    const scores = data.map(item => item.score);

    if (scoreChart) scoreChart.destroy();

    scoreChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "คะแนนที่ให้ตัวเอง",
                data: scores,
                borderColor: "#f09abb",
                backgroundColor: "rgba(240,154,187,.15)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#f09abb",
                pointBorderColor: "#fff",
                pointBorderWidth: 3,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { min: 1, max: 10, ticks: { stepSize: 1 } } }
        }
    });
}

/* =====================================================
   BADGES SYSTEM
===================================================== */
const BADGES_LIST = [
    { id: "first_log", icon: "🌱", title: "จุดเริ่มต้นเล็กๆ", desc: "บันทึกข้อมูลสุขภาพครั้งแรกสำเร็จ", check: (d) => d.length >= 1 },
    { id: "log_5", icon: "🌿", title: "ผู้เริ่มต้นจดบันทึก", desc: "บันทึกข้อมูลสะสมครบ 5 วัน", check: (d) => d.length >= 5 },
    { id: "log_10", icon: "🌳", title: "นักบันทึกประจำวัน", desc: "บันทึกข้อมูลสะสมครบ 10 วัน", check: (d) => d.length >= 10 },
    { id: "log_30", icon: "🏆", title: "เซียนบันทึกตัวจริง", desc: "บันทึกข้อมูลสะสมครบ 30 วัน", check: (d) => d.length >= 30 },
    { id: "streak_3", icon: "🔥", title: "ไฟแรงจัด", desc: "บันทึกข้อมูลติดต่อกัน 3 วันขึ้นไป", check: (d) => d.length >= 3 },
    { id: "streak_7", icon: "⚡", title: "วินัยเหล็กไหล", desc: "บันทึกข้อมูลสะสมครบ 7 วันขึ้นไป", check: (d) => d.length >= 7 },
    { id: "reading_start", icon: "📖", title: "เริ่มก้าวแรกนักอ่าน", desc: "อ่านหนังสือสะสมครบ 60 นาที (1 ชั่วโมง)", check: (d) => d.reduce((s, i) => s + (Number(i.reading) || 0), 0) >= 60 },
    { id: "reading_master", icon: "📚", title: "หนอนหนังสือ", desc: "อ่านหนังสือสะสมครบ 300 นาที (5 ชั่วโมง)", check: (d) => d.reduce((s, i) => s + (Number(i.reading) || 0), 0) >= 300 },
    { id: "reading_god", icon: "🎓", title: "คลังปัญญาเดินได้", desc: "อ่านหนังสือสะสมครบ 600 นาที (10 ชั่วโมง)", check: (d) => d.reduce((s, i) => s + (Number(i.reading) || 0), 0) >= 600 },
    { id: "reading_marathon", icon: "🕰️", title: "นักอ่านมาราธอน", desc: "อ่านหนังสือในวันเดียวเกิน 90 นาทีขึ้นไป", check: (d) => d.some(i => Number(i.reading) >= 90) },
    { id: "exercise_start", icon: "👟", title: "เริ่มขยับร่างกาย", desc: "ออกกำลังกายสะสมครบ 1 ครั้ง", check: (d) => d.filter(i => Number(i.exercise) > 0).length >= 1 },
    { id: "exercise_hero", icon: "🏃", title: "สายสตรอง", desc: "ออกกำลังกายสะสมครบ 5 ครั้ง", check: (d) => d.filter(i => Number(i.exercise) > 0).length >= 5 },
    { id: "exercise_champion", icon: "🥇", title: "ยอดนักแอธเลติก", desc: "ออกกำลังกายสะสมครบ 10 ครั้ง", check: (d) => d.filter(i => Number(i.exercise) > 0).length >= 10 },
    { id: "exercise_time_master", icon: "💪", title: "เบิร์นแคลอรี", desc: "ออกกำลังกายสะสมรวมครบ 300 นาที", check: (d) => d.reduce((s, i) => s + (Number(i.exercise) || 0), 0) >= 300 },
    { id: "happy_vibe", icon: "🥰", title: "วันแสนสดใส", desc: "บันทึกอารมณ์ 'ดีมาก' สะสมครบ 3 ครั้ง", check: (d) => d.filter(i => i.mood === "ดีมาก").length >= 3 },
    { id: "good_mood_master", icon: "🌈", title: "พลังบวกเต็มเปี่ยม", desc: "บันทึกอารมณ์ 'ดี' หรือ 'ดีมาก' รวมกันครบ 7 ครั้ง", check: (d) => d.filter(i => i.mood === "ดี" || i.mood === "ดีมาก").length >= 7 },
    { id: "embrace_sadness", icon: "🤍", title: "ยอมรับความรู้สึก", desc: "บันทึกอารมณ์เศร้าหรือเหนื่อย", check: (d) => d.some(i => i.mood === "เศร้า" || i.mood === "เหนื่อย") },
    { id: "perfect_score", icon: "🌟", title: "วันที่สมบูรณ์แบบ", desc: "ให้คะแนนตัวเอง 10/10 ในวันใดวันหนึ่ง", check: (d) => d.some(i => Number(i.score) === 10) },
    { id: "high_score_streak", icon: "✨", title: "ช่วงเวลาดีๆ", desc: "ให้คะแนนตัวเอง 8 ขึ้นไป สะสมครบ 5 ครั้ง", check: (d) => d.filter(i => Number(i.score) >= 8).length >= 5 },
    { id: "balanced_day", icon: "☯️", title: "ชีวิตสมดุล", desc: "ในวันเดียว มีทั้งอ่านหนังสือ (30+ นาที) และออกกำลังกาย (30+ นาที)", check: (d) => d.some(i => Number(i.reading) >= 30 && Number(i.exercise) >= 30) }
];

let unlockedBadgeIds = JSON.parse(localStorage.getItem("unlockedBadgeIds") || "[]");

function renderBadges() {
    const container = document.getElementById("badgesContainer");
    if (!container) return;

    let newlyUnlocked = [];

    container.innerHTML = BADGES_LIST.map(badge => {
        const isUnlocked = badge.check(healthData);

        if (isUnlocked && !unlockedBadgeIds.includes(badge.id)) {
            newlyUnlocked.push(badge);
            unlockedBadgeIds.push(badge.id);
        }

        return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" onclick="showBadgeDetail('${badge.title}', '${badge.desc}', '${badge.icon}', ${isUnlocked})">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-title">${badge.title}</div>
                <span class="badge-status-tag">${isUnlocked ? '✅ ปลดล็อกแล้ว' : '🔒 ล็อกอยู่'}</span>
            </div>
        `;
    }).join('');

    localStorage.setItem("unlockedBadgeIds", JSON.stringify(unlockedBadgeIds));

    if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(badge => {
            setTimeout(() => {
                alert(`🎉 ยินดีด้วย! คุณได้รับถ้วยรางวัลใหม่:\n\n${badge.icon} ${badge.title}\n"${badge.desc}"`);
            }, 500);
        });
    }
}

function showBadgeDetail(title, desc, icon, isUnlocked) {
    const statusText = isUnlocked ? "✅ ปลดล็อกเรียบร้อยแล้ว!" : "🔒 วิธีการปลดล็อก:";
    alert(`${icon} ${title}\n\n${statusText}\n${desc}`);
}

/* =====================================================
   RENDER RESULTS & INITIAL
===================================================== */
function renderResults() {
    renderCalendar();
    renderMoodTracker();
    renderHistory();
    renderActivityChart();
    renderScoreChart();
    renderBadges();
}

dateInput.value = getTodayString();
renderCalendar();
