/* =====================================================
   HEALTH TRACKER
===================================================== */


/* =====================================================
   DATA
===================================================== */
const supabaseUrl = "https://jdestfitkftlcswkugbi.supabase.co";
const supabaseKey = "sb_publishable_Ll0WBClWb5OKYjcoBi6-4w_z7bV3qa3";

// เปลี่ยนเป็น supabaseClient เพื่อไม่ให้ชื่อชนกับ window.supabase
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let healthData =
    JSON.parse(
        localStorage.getItem(
            "healthTrackerData"
        )
    ) || [];



/* =====================================================
   DOM
===================================================== */

const form =
    document.getElementById(
        "healthForm"
    );

const inputPage =
    document.getElementById(
        "inputPage"
    );

const resultsPage =
    document.getElementById(
        "resultsPage"
    );

const dateInput =
    document.getElementById(
        "date"
    );

const readingInput =
    document.getElementById(
        "reading"
    );

const exerciseInput =
    document.getElementById(
        "exercise"
    );

const exerciseTypeInput =
    document.getElementById(
        "exerciseType"
    );

const customExerciseGroup =
    document.getElementById(
        "customExerciseGroup"
    );

const customExerciseInput =
    document.getElementById(
        "customExercise"
    );

const scoreInput =
    document.getElementById(
        "score"
    );

const scoreValue =
    document.getElementById(
        "scoreValue"
    );

const savedMessage =
    document.getElementById(
        "savedMessage"
    );

const showResultsButton =
    document.getElementById(
        "showResultsButton"
    );

const backToInputButton =
    document.getElementById(
        "backToInputButton"
    );

const clearAllButton =
    document.getElementById(
        "clearAllButton"
    );

const moodTracker =
    document.getElementById(
        "moodTracker"
    );

const historyList =
    document.getElementById(
        "historyList"
    );

const calendarDays =
    document.getElementById(
        "calendarDays"
    );

const calendarTitle =
    document.getElementById(
        "calendarTitle"
    );

const prevMonthButton =
    document.getElementById(
        "prevMonth"
    );

const nextMonthButton =
    document.getElementById(
        "nextMonth"
    );



/* =====================================================
   MOOD CONFIG
===================================================== */

const moodConfig = {

    "เศร้า": {
        emoji: "😢",
        bulbClass: "bulb-sad",
        calendarClass: "mood-sad"
    },

    "เหนื่อย": {
        emoji: "😮‍💨",
        bulbClass: "bulb-tired",
        calendarClass: "mood-tired"
    },

    "เฉยๆ": {
        emoji: "😐",
        bulbClass: "bulb-normal",
        calendarClass: "mood-normal"
    },

    "ดี": {
        emoji: "🙂",
        bulbClass: "bulb-good",
        calendarClass: "mood-good"
    },

    "ดีมาก": {
        emoji: "🥰",
        bulbClass: "bulb-great",
        calendarClass: "mood-great"
    }

};



/* =====================================================
   THAI MONTHS
===================================================== */

const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];



/* =====================================================
   CALENDAR STATE
===================================================== */

const now = new Date();
let calendarYear = now.getFullYear();
let calendarMonth = now.getMonth();



/* =====================================================
   SCORE
===================================================== */

scoreInput.addEventListener(
    "input",
    () => {
        scoreValue.textContent = scoreInput.value;
    }
);



/* =====================================================
   EXERCISE TYPE
===================================================== */

exerciseTypeInput.addEventListener(
    "change",
    () => {
        if (exerciseTypeInput.value === "อื่น ๆ") {
            customExerciseGroup.classList.add("show");
            customExerciseInput.required = true;
            customExerciseInput.focus();
        } else {
            customExerciseGroup.classList.remove("show");
            customExerciseInput.required = false;
            customExerciseInput.value = "";
        }
    }
);



/* =====================================================
   TODAY
===================================================== */

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}



/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}



/* =====================================================
   SAVE LOCAL STORAGE
===================================================== */

function saveData() {
    localStorage.setItem(
        "healthTrackerData",
        JSON.stringify(healthData)
    );
}



/* =====================================================
   SORT DATA
===================================================== */

function getSortedData() {
    return [...healthData].sort(
        (a, b) => a.date.localeCompare(b.date)
    );
}



/* =====================================================
   FIND DATA BY DATE
===================================================== */

function getDataByDate(dateString) {
    return healthData.find(
        item => item.date === dateString
    );
}



/* =====================================================
   FORM SUBMIT
===================================================== */

form.addEventListener(
    "submit",
    async function(event) {
        event.preventDefault();

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

        /* Validate */
        if (!date) {
            alert("กรุณาเลือกวันที่ก่อนนะ 🌷");
            return;
        }

        if (!mood) {
            alert("กรุณาเลือกอารมณ์ของวันนี้ก่อนนะ 💗");
            return;
        }


        /* =========================================
           NEW DATA
        ========================================= */

        const newData = {
            id: Date.now(),
            date: date,
            mood: mood,
            reading: reading,
            exercise: exercise,
            exerciseType: exerciseType,
            score: score
        };


        /* =========================================
           CHECK EXISTING DATE
        ========================================= */

        const existingIndex = healthData.findIndex(
            item => item.date === date
        );

        if (existingIndex !== -1) {
            newData.id = healthData[existingIndex].id;
            healthData[existingIndex] = newData;
            alert("อัปเดตข้อมูลของวันนี้แล้ว 💕");
        } else {
            healthData.push(newData);
            alert("บันทึกข้อมูลเรียบร้อยแล้ว 🌷");
        }

        /* =========================================
           SAVE TO SUPABASE
        ========================================= */
        try {
            const { error } = await supabaseClient
                .from("daily_logs")
                .upsert({
                    date: newData.date,
                    mood: newData.mood,
                    note: "",
                    reading: newData.reading,
                    exercise: newData.exercise,
                    exercise_type: newData.exerciseType,
                    score: newData.score
                });

            if (error) console.error("Supabase Error:", error);
        } catch (err) {
            console.error("Fetch Error:", err);
        }

        saveData();

        /* Show result button */
        savedMessage.classList.add("show");
        savedMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
);



/* =====================================================
   SHOW RESULTS
===================================================== */

showResultsButton.addEventListener(
    "click",
    () => {
        inputPage.classList.add("hidden");
        resultsPage.classList.remove("hidden");
        renderResults();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);



/* =====================================================
   BACK TO INPUT
===================================================== */

backToInputButton.addEventListener(
    "click",
    () => {
        resultsPage.classList.add("hidden");
        inputPage.classList.remove("hidden");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);



/* =====================================================
   CALENDAR
===================================================== */

function renderCalendar() {
    calendarDays.innerHTML = "";
    calendarTitle.textContent = `${thaiMonths[calendarMonth]} ${calendarYear + 543}`;

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    /* Empty cells */
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        calendarDays.appendChild(empty);
    }

    /* Days */
    for (let day = 1; day <= daysInMonth; day++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";

        const monthString = String(calendarMonth + 1).padStart(2, "0");
        const dayString = String(day).padStart(2, "0");
        const dateString = `${calendarYear}-${monthString}-${dayString}`;

        const data = getDataByDate(dateString);

        /* Today */
        if (dateString === getTodayString()) {
            button.classList.add("today");
        }

        /* Has data */
        if (data) {
            const config = moodConfig[data.mood];
            button.classList.add("has-data");
            if (config) {
                button.classList.add(config.calendarClass);
            }
            button.title = `บันทึกแล้ว: ${data.mood}`;
        }

        button.textContent = day;

        /* Click date */
        button.addEventListener("click", () => {
            resultsPage.classList.add("hidden");
            inputPage.classList.remove("hidden");
            dateInput.value = dateString;
            loadDataToForm(dateString);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        calendarDays.appendChild(button);
    }
}



/* =====================================================
   PREVIOUS MONTH
===================================================== */

prevMonthButton.addEventListener("click", () => {
    calendarMonth--;
    if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }
    renderCalendar();
});



/* =====================================================
   NEXT MONTH
===================================================== */

nextMonthButton.addEventListener("click", () => {
    calendarMonth++;
    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    }
    renderCalendar();
});



/* =====================================================
   LOAD DATA TO FORM
===================================================== */

function loadDataToForm(dateString) {
    const data = getDataByDate(dateString);

    /* Reset mood */
    document.querySelectorAll('input[name="mood"]').forEach(radio => {
        radio.checked = false;
    });

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

    /* Mood */
    const moodRadio = document.querySelector(`input[name="mood"][value="${data.mood}"]`);
    if (moodRadio) {
        moodRadio.checked = true;
    }

    /* Reading */
    readingInput.value = data.reading;

    /* Exercise */
    exerciseInput.value = data.exercise;

    /* Exercise type */
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

    /* Score */
    scoreInput.value = data.score;
    scoreValue.textContent = data.score;
}



/* =====================================================
   MOOD TRACKER
===================================================== */

function renderMoodTracker() {
    moodTracker.innerHTML = "";
    const data = getSortedData();

    if (data.length === 0) {
        moodTracker.innerHTML = `
            <div class="empty-state">
                ยังไม่มีข้อมูล ลองบันทึกวันแรกดูนะ 🌱
            </div>
        `;
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
            <div class="mood-day-date">
                ${formatDate(item.date)}
            </div>
            <div class="mood-day-name">
                ${item.mood}
            </div>
        `;

        moodTracker.appendChild(moodDay);
    });
}



/* =====================================================
   HISTORY
===================================================== */

function renderHistory() {
    historyList.innerHTML = "";
    const data = getSortedData().reverse();

    if (data.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                ยังไม่มีบันทึก 🌷
            </div>
        `;
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
            <div class="history-date">
                📅 ${formatDate(item.date)}
            </div>
            <div class="history-mood">
                ${config ? config.emoji : '😐'} ${item.mood}
            </div>
            <div class="history-info">
                📚 ${item.reading} นาที
                <br>
                ${exerciseText}
            </div>
            <div class="history-score">
                ⭐ ${item.score}/10
            </div>
            <button class="delete-button" onclick="deleteData(${item.id})">
                🗑️
            </button>
        `;

        historyList.appendChild(historyItem);
    });
}



/* =====================================================
   DELETE ONE
===================================================== */

function deleteData(id) {
    const confirmed = confirm("ต้องการลบข้อมูลวันนี้ใช่ไหม? 🥺");
    if (!confirmed) return;

    healthData = healthData.filter(item => item.id !== id);
    saveData();
    renderResults();
}



/* =====================================================
   CLEAR ALL
===================================================== */

clearAllButton.addEventListener("click", () => {
    if (healthData.length === 0) {
        alert("ตอนนี้ยังไม่มีข้อมูลให้ลบนะ 🌱");
        return;
    }

    const confirmed = confirm(
        "ต้องการล้างข้อมูลทั้งหมดจริง ๆ ใช่ไหม?\n\nข้อมูลทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้ 🥺"
    );
    if (!confirmed) return;

    healthData = [];
    localStorage.removeItem("healthTrackerData");
    localStorage.removeItem("unlockedBadgeIds");

    form.reset();
    scoreInput.value = 5;
    scoreValue.textContent = 5;
    dateInput.value = getTodayString();
    customExerciseGroup.classList.remove("show");
    customExerciseInput.value = "";
    customExerciseInput.required = false;
    savedMessage.classList.remove("show");

    renderResults();
    alert("ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว 🌷");
});



/* =====================================================
   ACTIVITY CHART
===================================================== */

let activityChart = null;

function renderActivityChart() {
    const canvas = document.getElementById("activityChart");
    const data = getSortedData();

    const labels = data.map(item => formatDate(item.date).substring(0, 5));
    const readingData = data.map(item => item.reading);
    const exerciseData = data.map(item => item.exercise);

    if (activityChart) {
        activityChart.destroy();
    }

    activityChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "อ่านหนังสือ 📚",
                    data: readingData,
                    backgroundColor: "#c8b5ed",
                    borderRadius: 10,
                    borderSkipped: false
                },
                {
                    label: "ออกกำลังกาย 🏃",
                    data: exerciseData,
                    backgroundColor: "#a9d8bd",
                    borderRadius: 10,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: { family: "Kanit" }
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, title: { display: true, text: "นาที" } }
            }
        }
    });
}



/* =====================================================
   SCORE CHART
===================================================== */

let scoreChart = null;

function renderScoreChart() {
    const canvas = document.getElementById("scoreChart");
    const data = getSortedData();

    const labels = data.map(item => formatDate(item.date).substring(0, 5));
    const scores = data.map(item => item.score);

    if (scoreChart) {
        scoreChart.destroy();
    }

    scoreChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
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
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { min: 1, max: 10, ticks: { stepSize: 1 } }
            }
        }
    });
}



/* =====================================================
   GAMIFICATION / BADGES SYSTEM (20 BADGES)
===================================================== */

// 1. รายการถ้วยรางวัลทั้งหมด 20 รายการ
const BADGES_LIST = [
    // --- หมวด: เริ่มต้น & บันทึกทั่วไป ---
    {
        id: "first_log",
        icon: "🌱",
        title: "จุดเริ่มต้นเล็กๆ",
        desc: "บันทึกข้อมูลสุขภาพครั้งแรกสำเร็จ",
        check: (data) => data.length >= 1
    },
    {
        id: "log_5",
        icon: "🌿",
        title: "ผู้เริ่มต้นจดบันทึก",
        desc: "บันทึกข้อมูลสะสมครบ 5 วัน",
        check: (data) => data.length >= 5
    },
    {
        id: "log_10",
        icon: "🌳",
        title: "นักบันทึกประจำวัน",
        desc: "บันทึกข้อมูลสะสมครบ 10 วัน",
        check: (data) => data.length >= 10
    },
    {
        id: "log_30",
        icon: "🏆",
        title: "เซียนบันทึกตัวจริง",
        desc: "บันทึกข้อมูลสะสมครบ 30 วัน",
        check: (data) => data.length >= 30
    },

    // --- หมวด: วินัยต่อเนื่อง (Streak) ---
    {
        id: "streak_3",
        icon: "🔥",
        title: "ไฟแรงจัด",
        desc: "บันทึกข้อมูลติดต่อกัน 3 วันขึ้นไป",
        check: (data) => data.length >= 3
    },
    {
        id: "streak_7",
        icon: "⚡",
        title: "วินัยเหล็กไหล",
        desc: "บันทึกข้อมูลสะสมครบ 7 วันขึ้นไป",
        check: (data) => data.length >= 7
    },

    // --- หมวด: การอ่านหนังสือ 📚 ---
    {
        id: "reading_start",
        icon: "📖",
        title: "เริ่มก้าวแรกนักอ่าน",
        desc: "อ่านหนังสือสะสมครบ 60 นาที (1 ชั่วโมง)",
        check: (data) => data.reduce((sum, item) => sum + (Number(item.reading) || 0), 0) >= 60
    },
    {
        id: "reading_master",
        icon: "📚",
        title: "หนอนหนังสือ",
        desc: "อ่านหนังสือสะสมครบ 300 นาที (5 ชั่วโมง)",
        check: (data) => data.reduce((sum, item) => sum + (Number(item.reading) || 0), 0) >= 300
    },
    {
        id: "reading_god",
        icon: "🎓",
        title: "คลังปัญญาเดินได้",
        desc: "อ่านหนังสือสะสมครบ 600 นาที (10 ชั่วโมง)",
        check: (data) => data.reduce((sum, item) => sum + (Number(item.reading) || 0), 0) >= 600
    },
    {
        id: "reading_marathon",
        icon: "🕰️",
        title: "นักอ่านมาราธอน",
        desc: "อ่านหนังสือในวันเดียวเกิน 90 นาทีขึ้นไป",
        check: (data) => data.some(item => Number(item.reading) >= 90)
    },

    // --- หมวด: การออกกำลังกาย 🏃 ---
    {
        id: "exercise_start",
        icon: "👟",
        title: "เริ่มขยับร่างกาย",
        desc: "ออกกำลังกายสะสมครบ 1 ครั้ง",
        check: (data) => data.filter(item => Number(item.exercise) > 0).length >= 1
    },
    {
        id: "exercise_hero",
        icon: "🏃",
        title: "สายสตรอง",
        desc: "ออกกำลังกายสะสมครบ 5 ครั้ง",
        check: (data) => data.filter(item => Number(item.exercise) > 0).length >= 5
    },
    {
        id: "exercise_champion",
        icon: "🥇",
        title: "ยอดนักแอธเลติก",
        desc: "ออกกำลังกายสะสมครบ 10 ครั้ง",
        check: (data) => data.filter(item => Number(item.exercise) > 0).length >= 10
    },
    {
        id: "exercise_time_master",
        icon: "💪",
        title: "เบิร์นแคลอรี",
        desc: "ออกกำลังกายสะสมรวมครบ 300 นาที",
        check: (data) => data.reduce((sum, item) => sum + (Number(item.exercise) || 0), 0) >= 300
    },

    // --- หมวด: อารมณ์ & ความสุข 🥰 ---
    {
        id: "happy_vibe",
        icon: "🥰",
        title: "วันแสนสดใส",
        desc: "บันทึกอารมณ์ 'ดีมาก' สะสมครบ 3 ครั้ง",
        check: (data) => data.filter(item => item.mood === "ดีมาก").length >= 3
    },
    {
        id: "good_mood_master",
        icon: "🌈",
        title: "พลังบวกเต็มเปี่ยม",
        desc: "บันทึกอารมณ์ 'ดี' หรือ 'ดีมาก' รวมกันครบ 7 ครั้ง",
        check: (data) => data.filter(item => item.mood === "ดี" || item.mood === "ดีมาก").length >= 7
    },
    {
        id: "embrace_sadness",
        icon: "🤍",
        title: "ยอมรับความรู้สึก",
        desc: "บันทึกอารมณ์เศร้าหรือเหนื่อย (การเปิดรับอารมณ์ตัวเองอย่างจริงใจ)",
        check: (data) => data.some(item => item.mood === "เศร้า" || item.mood === "เหนื่อย")
    },

    // --- หมวด: คะแนนประเมินตนเอง ⭐ ---
    {
        id: "perfect_score",
        icon: "🌟",
        title: "วันที่สมบูรณ์แบบ",
        desc: "ให้คะแนนตัวเอง 10/10 ในวันใดวันหนึ่ง",
        check: (data) => data.some(item => Number(item.score) === 10)
    },
    {
        id: "high_score_streak",
        icon: "✨",
        title: "ช่วงเวลาดีๆ",
        desc: "ให้คะแนนตัวเอง 8 ขึ้นไป สะสมครบ 5 ครั้ง",
        check: (data) => data.filter(item => Number(item.score) >= 8).length >= 5
    },

    // --- หมวด: ความสมดุลชีวิต (Balanced Life) ⚖️ ---
    {
        id: "balanced_day",
        icon: "☯️",
        title: "ชีวิตสมดุล",
        desc: "ในวันเดียว มีทั้งอ่านหนังสือ (30+ นาที) และออกกำลังกาย (30+ นาที)",
        check: (data) => data.some(item => Number(item.reading) >= 30 && Number(item.exercise) >= 30)
    }
];

// เก็บ ID ของ Badge ที่ปลดล็อกไปแล้วเพื่อเช็กแจ้งเตือน
let unlockedBadgeIds = JSON.parse(localStorage.getItem("unlockedBadgeIds") || "[]");

// 2. ฟังก์ชันแสดงผลและเช็กปลดล็อก Badges
function renderBadges() {
    const container = document.getElementById("badgesContainer");
    if (!container) return;

    let newlyUnlocked = [];

    container.innerHTML = BADGES_LIST.map(badge => {
        const isUnlocked = badge.check(healthData);

        // เช็กว่าเป็นถ้วยใหม่ที่เพิ่งปลดล็อกได้หรือไม่
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

    // บันทึก ID ที่ปลดล็อกแล้วลง LocalStorage
    localStorage.setItem("unlockedBadgeIds", JSON.stringify(unlockedBadgeIds));

    // ถ้ามีถ้วยรางวัลใหม่ที่เพิ่งปลดล็อก ให้ขึ้นแจ้งเตือนยินดี
    if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(badge => {
            setTimeout(() => {
                alert(`🎉 ยินดีด้วย! คุณได้รับถ้วยรางวัลใหม่:\n\n${badge.icon} ${badge.title}\n"${badge.desc}"`);
            }, 500);
        });
    }
}

// 3. ฟังก์ชันสำหรับกดดูเงื่อนไขถ้วยรางวัล
function showBadgeDetail(title, desc, icon, isUnlocked) {
    const statusText = isUnlocked ? "✅ ปลดล็อกเรียบร้อยแล้ว!" : "🔒 วิธีการปลดล็อก:";
    alert(`${icon} ${title}\n\n${statusText}\n${desc}`);
}



/* =====================================================
   RENDER RESULTS
===================================================== */

function renderResults() {
    renderCalendar();
    renderMoodTracker();
    renderHistory();
    renderActivityChart();
    renderScoreChart();
    renderBadges(); // เรียกใช้วาดถ้วยรางวัล
}



/* =====================================================
   INITIAL
===================================================== */

dateInput.value = getTodayString();
renderCalendar();
