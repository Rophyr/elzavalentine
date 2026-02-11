const questions = [
  { text: "placeholder question 1", yes: "placeholder yes 1", no: "placeholder no 1" },
  { text: "placeholder question 2", yes: "placeholder yes 2", no: "placeholder no 2" },
  { text: "placeholder question 3", yes: "placeholder yes 3", no: "placeholder no 3" },
  { text: "placeholder question 4", yes: "placeholder yes 4", no: "placeholder no 4" },
  { text: "placeholder question 5", yes: "placeholder yes 5", no: "placeholder no 5" },
];

const questionEl = document.getElementById("question");
const questionCountEl = document.getElementById("question-count");
const progressFill = document.getElementById("progress-fill");
const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");
const result = document.getElementById("result");
const questionSection = document.querySelector(".question");
const restartButton = document.getElementById("restart-button");
const statusLine = document.getElementById("status-line");
const answersArea = document.getElementById("answers-area");
const themeToggle = document.getElementById("theme-toggle");
const sparkleButton = document.getElementById("sparkle-button");
const playlistButton = document.getElementById("playlist-button");
const confettiLayer = document.getElementById("confetti-layer");

let currentIndex = 0;
let playlistMode = false;

const setStatus = (text) => {
  statusLine.textContent = text;
};

const updateQuestion = () => {
  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  questionEl.textContent = current.text;
  questionCountEl.textContent = `${currentIndex + 1}/${questions.length}`;
  progressFill.style.width = `${progress}%`;
  yesButton.textContent = current.yes;
  noButton.textContent = current.no;
  noButton.classList.remove("caught");
  noButton.style.transform = "translate(0, 0)";

  document.querySelector(".progress-bar").setAttribute("aria-valuenow", String(currentIndex + 1));
};

const moveNoButton = (event) => {
  if (noButton.classList.contains("caught")) {
    return;
  }

  const areaRect = answersArea.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();

  const maxX = Math.max(0, areaRect.width - buttonRect.width);
  const maxY = Math.max(0, areaRect.height - buttonRect.height);

  const nearCursor =
    event &&
    event.clientX >= buttonRect.left - 70 &&
    event.clientX <= buttonRect.right + 70 &&
    event.clientY >= buttonRect.top - 70 &&
    event.clientY <= buttonRect.bottom + 70;

  if (event && !nearCursor && event.type === "mousemove") {
    return;
  }

  const nextX = Math.floor(Math.random() * maxX);
  const nextY = Math.floor(Math.random() * maxY);
  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;
  noButton.style.transform = "translate(0, 0)";
};

const spawnHearts = (count = 12) => {
  const icons = ["💗", "💘", "💞", "✨", "🌸"];
  for (let i = 0; i < count; i += 1) {
    const item = document.createElement("span");
    item.className = "confetti";
    item.textContent = icons[Math.floor(Math.random() * icons.length)];
    item.style.left = `${Math.random() * 100}vw`;
    item.style.animationDuration = `${2.8 + Math.random() * 2.8}s`;
    item.style.opacity = `${0.55 + Math.random() * 0.35}`;
    confettiLayer.appendChild(item);
    setTimeout(() => item.remove(), 6500);
  }
};

const showResult = () => {
  questionSection.hidden = true;
  result.hidden = false;
  spawnHearts(24);
  setStatus("placeholder success status");
};

const reset = () => {
  currentIndex = 0;
  questionSection.hidden = false;
  result.hidden = true;
  updateQuestion();
  setStatus("placeholder reset status");
};

yesButton.addEventListener("click", () => {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    updateQuestion();
    setStatus("placeholder next question status");
    return;
  }
  showResult();
});

noButton.addEventListener("mouseenter", moveNoButton);
answersArea.addEventListener("mousemove", moveNoButton);
noButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
});

noButton.addEventListener("click", () => {
  noButton.classList.add("caught");
  noButton.textContent = "You meant yes";
  setStatus("placeholder no-click status");
  spawnHearts(8);
});

restartButton.addEventListener("click", reset);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  setStatus("placeholder theme toggled status");
});

sparkleButton.addEventListener("click", () => {
  spawnHearts(16);
  setStatus("placeholder sparkle status");
});

playlistButton.addEventListener("click", () => {
  playlistMode = !playlistMode;
  playlistButton.textContent = `playlist mode: ${playlistMode ? "on" : "off"}`;
  setStatus("placeholder playlist mode status");
});

updateQuestion();
setStatus("placeholder ready status");
