
const TOTAL_PITS = 12;
const QUAN_LEFT = 10;
const QUAN_RIGHT = 11;

// Mỗi ô dân có 5 quân, hai ô quan bắt đầu trống.
const initialBoard = () => [
    5, 5, 5, 5, 5,
    5, 5, 5, 5, 5,
    0, 0
];

let board = initialBoard();
let score = 0;
let collected = 0;
let turn = 0;
let started = false;
let busy = false;
let soundEnabled = true;
let audioContext = null;

const pits = document.querySelectorAll(".pit");

const scoreDisplay = document.getElementById("score");
const collectedDisplay = document.getElementById("collected");
const turnDisplay = document.getElementById("turn");
const statusDisplay = document.getElementById("gameStatus");
const messageDisplay = document.getElementById("message");

const questionTitle = document.getElementById("questionTitle");
const questionType = document.getElementById("questionType");
const answerList = document.getElementById("answerList");
const feedback = document.getElementById("questionFeedback");

// ===============================
// NGÂN HÀNG CÂU HỎI
// ===============================

const normalQuestions = [
    {
        question: "Ca trù Cổ Đạm thuộc loại hình nghệ thuật nào?",
        answers: ["Âm nhạc dân gian", "Múa cung đình", "Hội họa", "Điêu khắc"],
        correct: 0,
        explanation: "Ca trù là một loại hình nghệ thuật âm nhạc truyền thống của Việt Nam."
    },
    {
        question: "Cầu Rồng là công trình nổi tiếng của thành phố nào?",
        answers: ["Hà Nội", "Đà Nẵng", "Huế", "Cần Thơ"],
        correct: 1,
        explanation: "Cầu Rồng bắc qua sông Hàn, là biểu tượng nổi bật của Đà Nẵng."
    },
    {
        question: "Lễ Khao lề thế lính Hoàng Sa gắn với hoạt động nào?",
        answers: [
            "Tưởng nhớ binh lính ra Hoàng Sa",
            "Mừng mùa lúa mới",
            "Cầu mưa thuận gió hòa",
            "Tưởng nhớ các vị vua"
        ],
        correct: 0,
        explanation: "Nghi lễ thể hiện sự tri ân những người lính từng thực hiện nhiệm vụ tại Hoàng Sa."
    },
    {
        question: "Không gian văn hóa Cồng chiêng gắn bó mật thiết với khu vực nào?",
        answers: ["Tây Bắc", "Đồng bằng Bắc Bộ", "Tây Nguyên", "Nam Bộ"],
        correct: 2,
        explanation: "Cồng chiêng là nét văn hóa đặc trưng của nhiều cộng đồng dân tộc ở Tây Nguyên."
    },
    {
        question: "Lễ hội Katê là lễ hội truyền thống tiêu biểu của dân tộc nào?",
        answers: ["Chăm", "Ê Đê", "S'tiêng", "Khmer"],
        correct: 0,
        explanation: "Katê là lễ hội quan trọng trong đời sống văn hóa của người Chăm."
    },
    {
        question: "Gốm Bàu Trúc nổi tiếng với nghề thủ công nào?",
        answers: ["Đúc đồng", "Làm gốm", "Dệt vải", "Chạm bạc"],
        correct: 1,
        explanation: "Gốm Bàu Trúc nổi tiếng với kỹ thuật làm gốm thủ công truyền thống của người Chăm."
    },
    {
        question: "Nhà dài là kiểu nhà truyền thống tiêu biểu của dân tộc nào?",
        answers: ["Ê Đê", "Chăm", "Kinh", "Hoa"],
        correct: 0,
        explanation: "Nhà dài là một nét kiến trúc truyền thống đặc trưng của người Ê Đê."
    },
    {
        question: "Dệt thổ cẩm S'tiêng gắn với nghề truyền thống nào?",
        answers: ["Đúc đồng", "Dệt vải", "Làm gốm", "Chạm bạc"],
        correct: 1,
        explanation: "Dệt thổ cẩm góp phần lưu giữ bản sắc văn hóa của cộng đồng S'tiêng."
    },
    {
        question: "Bưu điện Trung tâm Sài Gòn nằm ở thành phố nào?",
        answers: ["Đà Nẵng", "Hà Nội", "TP. Hồ Chí Minh", "Huế"],
        correct: 2,
        explanation: "Đây là công trình kiến trúc nổi tiếng tại trung tâm TP. Hồ Chí Minh."
    },
    {
        question: "Lễ Vía Bà Linh Sơn Thánh Mẫu gắn với địa danh nào?",
        answers: ["Núi Bà Đen", "Núi Sam", "Núi Bà Nà", "Núi Cấm"],
        correct: 0,
        explanation: "Lễ hội gắn liền với tín ngưỡng thờ Linh Sơn Thánh Mẫu tại núi Bà Đen."
    },
    {
        question: "Hát Sắc Bùa Phú Lễ thường được biểu diễn vào dịp nào?",
        answers: ["Tết Nguyên đán", "Tết Trung thu", "Lễ Vu Lan", "Quốc khánh"],
        correct: 0,
        explanation: "Hát Sắc Bùa thường gắn với dịp Tết và lời chúc năm mới."
    },
    {
        question: "Chợ nổi Cái Răng nổi tiếng thuộc địa phương nào?",
        answers: ["Cần Thơ", "Mỹ Tho", "Long Xuyên", "Rạch Giá"],
        correct: 0,
        explanation: "Chợ nổi Cái Răng là nét văn hóa giao thương sông nước đặc trưng của Cần Thơ."
    }
];

const quanQuestions = [
    {
        question: "Một di sản văn hóa phi vật thể được UNESCO ghi danh không đồng nghĩa với việc di sản đó chỉ thuộc về một cộng đồng. Hãy chọn nhận định chính xác nhất về giá trị của việc ghi danh di sản.",
        answers: [
            "Biến di sản thành tài sản riêng của UNESCO",
            "Góp phần nâng cao nhận thức, bảo vệ và trao truyền di sản",
            "Bắt buộc mọi địa phương phải tổ chức lễ hội giống nhau",
            "Thay thế hoàn toàn vai trò của cộng đồng thực hành"
        ],
        correct: 1,
        explanation: "Việc ghi danh góp phần nâng cao nhận thức và thúc đẩy bảo vệ di sản; cộng đồng vẫn giữ vai trò trung tâm."
    },
    {
        question: "Một lễ hội truyền thống được tổ chức qua nhiều thế hệ. Để bảo tồn bền vững, cách làm nào phù hợp nhất?",
        answers: [
            "Giữ nguyên mọi hình thức, không cho phép thay đổi",
            "Chỉ tập trung quảng bá du lịch và bán vé",
            "Để cộng đồng chủ thể tham gia gìn giữ, trao truyền và thích ứng phù hợp",
            "Chuyển toàn bộ hoạt động cho doanh nghiệp tổ chức"
        ],
        correct: 2,
        explanation: "Bảo tồn bền vững cần đặt cộng đồng chủ thể ở vị trí trung tâm, đồng thời thích ứng có chọn lọc."
    }
];

// ===============================
// ÂM THANH BẰNG JAVASCRIPT
// ===============================

function playSound(type) {
    if (!soundEnabled) return;

    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    try {
        if (!audioContext) {
            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const sounds = {
            click: [420],
            move: [350],
            correct: [520, 660, 820],
            wrong: [260, 190],
            win: [520, 660, 780, 1040]
        };

        const frequencies = sounds[type] || [440];

        frequencies.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            const start = audioContext.currentTime + index * 0.12;

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(frequency, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.1, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start(start);
            oscillator.stop(start + 0.22);
        });
    } catch (error) {
        console.warn("Không thể phát âm thanh:", error);
    }
}

// ===============================
// CẬP NHẬT GIAO DIỆN
// ===============================

function updateBoard() {
    board.forEach((amount, index) => {
        const pieceDisplay = document.getElementById(`pieces-${index}`);
        pieceDisplay.textContent = amount;

        const pit = document.querySelector(`[data-pit="${index}"]`);
        pit.classList.remove("selected");

        if (index < 10) {
            pit.disabled = !started || busy || amount === 0;
        } else {
            pit.disabled = true;
        }
    });

    scoreDisplay.textContent = score;
    collectedDisplay.textContent = collected;
    turnDisplay.textContent = turn;
}

function setMessage(message) {
    messageDisplay.textContent = message;
}

// ===============================
// HƯỚNG RẢI QUÂN
// ===============================

// Thứ tự ngược kim đồng hồ.
// Mỗi bước giảm chỉ số một đơn vị, quay vòng từ 0 về 11.
function nextPit(index) {
    return (index - 1 + TOTAL_PITS) % TOTAL_PITS;
}

// ===============================
// RẢI QUÂN
// ===============================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sowFrom(startIndex) {
    if (!started || busy || board[startIndex] === 0) return;

    busy = true;
    turn++;

    playSound("click");

    const selectedPit = document.querySelector(
        `[data-pit="${startIndex}"]`
    );

    selectedPit.classList.add("selected");

    // Nhặt toàn bộ quân ở ô được chọn.
    let seeds = board[startIndex];
    board[startIndex] = 0;

    updateBoard();

    setMessage("Đang nhặt quân và chuẩn bị rải...");

    await sleep(350);

    let current = startIndex;
    let safetyCounter = 0;

    // Tiếp tục rải theo luật A.
    while (safetyCounter < 500) {
        safetyCounter++;

        // Rải từng quân một.
        while (seeds > 0) {
            current = nextPit(current);

            board[current]++;
            seeds--;

            updateBoard();
            playSound("move");

            await sleep(160);
        }

        // Ô tiếp theo sau ô vừa rải.
        const next = nextPit(current);

        // Nếu ô kế tiếp có quân: nhặt lên và tiếp tục rải.
        if (board[next] > 0) {
            current = next;
            seeds = board[current];
            board[current] = 0;

            updateBoard();

            setMessage(
                `Ô ${current < 10 ? current + 1 : "quan"} có quân. Tiếp tục rải!`
            );

            await sleep(300);
            continue;
        }

        // Nếu ô kế tiếp trống, xét ô sau nó.
        const target = nextPit(next);

        if (board[target] > 0) {
            setMessage(
                "Đã gặp ô trống! Ô tiếp theo có quân, hãy trả lời câu hỏi để ăn quân."
            );

            await sleep(350);

            await askQuestion(target);
        } else {
            setMessage("Hai ô liên tiếp đều trống. Lượt chơi kết thúc!");
            await sleep(500);
        }

        break;
    }

    // Nếu vòng rải vượt giới hạn an toàn.
    if (safetyCounter >= 500) {
        setMessage("Lượt rải đã dừng để tránh lặp quá lâu.");
    }

    busy = false;

    updateBoard();

    // Nếu không còn quân ở các ô dân thì kết thúc.
    if (board.slice(0, 10).every(amount => amount === 0)) {
        endGame();
        return;
    }

    if (started) {
        setMessage("Đến lượt bạn! Hãy chọn một ô dân còn quân.");
        statusDisplay.textContent = "Đang chờ chọn ô";
    }
}

// ===============================
// CÂU HỎI VÀ ĂN QUÂN
// ===============================

function chooseQuestion(targetIndex) {
    if (targetIndex === QUAN_LEFT) {
        return quanQuestions[0];
    }

    if (targetIndex === QUAN_RIGHT) {
        return quanQuestions[1];
    }

    return normalQuestions[
        Math.floor(Math.random() * normalQuestions.length)
    ];
}

function askQuestion(targetIndex) {
    return new Promise(resolve => {
        const question = chooseQuestion(targetIndex);
        const isQuan = targetIndex >= 10;

        const amount = board[targetIndex];

        questionType.textContent = isQuan
            ? "🏆 THỬ THÁCH Ô QUAN"
            : "📜 CÂU HỎI Ô DÂN";

        questionType.style.color = isQuan ? "#f3cf69" : "#e7ad58";

        questionTitle.textContent = question.question;

        feedback.textContent = isQuan
            ? `Ô quan đang có ${amount} quân. Trả lời đúng để thu số quân này!`
            : `Ô đang có ${amount} quân. Trả lời đúng để nhận ${amount} điểm!`;

        answerList.innerHTML = "";

        question.answers.forEach((answer, index) => {
            const button = document.createElement("button");
            button.className = "answer";
            button.textContent =
                `${String.fromCharCode(65 + index)}. ${answer}`;

            button.addEventListener("click", () => {
                const buttons = answerList.querySelectorAll("button");

                buttons.forEach(item => {
                    item.disabled = true;
                });

                if (index === question.correct) {
                    button.classList.add("correct");

                    // Thu toàn bộ quân trong ô.
                    board[targetIndex] = 0;

                    // Mỗi quân tương ứng một điểm.
                    score += amount;
                    collected += amount;

                    playSound("correct");

                    feedback.textContent =
                        `🎉 Chính xác! Bạn đã ăn ${amount} quân và nhận ${amount} điểm. ${question.explanation}`;
                } else {
                    button.classList.add("wrong");
                    buttons[question.correct].classList.add("correct");

                    playSound("wrong");

                    feedback.textContent =
                        `❌ Chưa chính xác! Bạn không nhận được quân. ${question.explanation}`;
                }

                updateBoard();

                const finishButton = document.createElement("button");
                finishButton.className = "answer";
                finishButton.textContent = "Tiếp tục lượt chơi →";

                finishButton.addEventListener("click", () => {
                    finishButton.remove();

                    questionTitle.textContent =
                        "Lượt chơi đã kết thúc.";

                    questionType.textContent = "HOÀN THÀNH LƯỢT";
                    answerList.innerHTML =
                        '<p class="placeholder">Hãy chọn một ô dân khác để tiếp tục.</p>';

                    feedback.textContent = "";
                    resolve();
                });

                answerList.appendChild(finishButton);
            });

            answerList.appendChild(button);
        });

        document.getElementById("questionPanel").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
}

// ===============================
// BẮT ĐẦU VÀ CHỌN Ô
// ===============================

function startGame() {
    if (started) return;

    started = true;

    document.getElementById("startBtn").disabled = true;
    document.getElementById("startBtn").textContent = "Đang chơi";

    statusDisplay.textContent = "Đang chờ chọn ô";
    setMessage("Hãy chọn một ô dân có quân để bắt đầu rải!");

    questionTitle.textContent = "Chọn một ô trên bàn để bắt đầu.";
    questionType.textContent = "SẴN SÀNG";
    answerList.innerHTML =
        '<p class="placeholder">Câu hỏi sẽ xuất hiện khi bạn ăn quân.</p>';
    feedback.textContent = "";

    playSound("click");
    updateBoard();
}

pits.forEach(pit => {
    pit.addEventListener("click", () => {
        const index = Number(pit.dataset.pit);

        // Không cho chọn ô quan.
        if (index >= 10) return;

        if (!started) {
            setMessage("Bạn cần nhấn Bắt đầu trước!");
            return;
        }

        if (busy) return;

        if (board[index] === 0) {
            setMessage("Ô này đã hết quân. Hãy chọn ô khác!");
            return;
        }

        sowFrom(index);
    });
});

// ===============================
// KẾT THÚC GAME
// ===============================

function endGame() {
    started = false;

    statusDisplay.textContent = "Đã hoàn thành";
    setMessage(`🎊 Chúc mừng! Bạn đạt ${score} điểm và thu thập ${collected} quân.`);

    questionType.textContent = "🏆 KẾT THÚC TRÒ CHƠI";
    questionTitle.textContent = "Bạn đã hoàn thành hành trình khám phá!";
    answerList.innerHTML = `
        <div class="answer">⭐ Tổng điểm: ${score}</div>
        <div class="answer">🪙 Quân đã ăn: ${collected}</div>
    `;

    feedback.textContent =
        "Cảm ơn bạn đã tham gia và khám phá văn hóa Việt Nam!";

    document.getElementById("startBtn").disabled = true;
    document.getElementById("startBtn").textContent = "Đã hoàn thành";

    playSound("win");
    updateBoard();
}

// ===============================
// CHƠI LẠI
// ===============================

function restartGame() {
    board = initialBoard();

    score = 0;
    collected = 0;
    turn = 0;

    started = false;
    busy = false;

    document.getElementById("startBtn").disabled = false;
    document.getElementById("startBtn").textContent = "▶ Bắt đầu";

    statusDisplay.textContent = "Nhấn Bắt đầu để chơi";

    setMessage("Nhấn Bắt đầu, sau đó chọn một ô dân có quân.");

    questionType.textContent = "THỬ THÁCH";
    questionTitle.textContent = "Câu hỏi sẽ xuất hiện tại đây";

    answerList.innerHTML =
        '<p class="placeholder">Hãy bắt đầu trò chơi để khám phá.</p>';

    feedback.textContent = "";

    updateBoard();
    playSound("click");
}

// ===============================
// CÁC NÚT ĐIỀU KHIỂN
// ===============================

document.getElementById("startBtn").addEventListener("click", startGame);

document.getElementById("restartBtn").addEventListener("click", restartGame);

document.getElementById("soundBtn").addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    document.getElementById("soundBtn").textContent =
        soundEnabled ? "🔊 Âm thanh: Bật" : "🔇 Âm thanh: Tắt";

    if (soundEnabled) {
        playSound("click");
    }
});

// Khởi tạo giao diện ban đầu.
updateBoard();
