const questions = [
  {
    text: "Princesse Elza, Valentine duo with me?",
    yes: "Queue duo 💜",
    no: "Nah",
  },
  {
    text: "Cutie, should I keep sending Mel highlights?",
    yes: "Yes, send clips",
    no: "Too many clips",
  },
  {
    text: "Russia to France arc this year — I help with logistics?",
    yes: "Yes, partner mode",
    no: "I got it solo",
  },
  {
    text: "French + Korean study dates with snacks?",
    yes: "Oui / 네 / Yes",
    no: "No snacks",
  },
];

const questionEl = document.getElementById("question");
const questionCountEl = document.getElementById("question-count");
const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");
const result = document.getElementById("result");
const questionSection = document.querySelector(".question");
const restartButton = document.getElementById("restart-button");

let currentIndex = 0;

const updateQuestion = () => {
  const current = questions[currentIndex];
  questionEl.textContent = current.text;
  questionCountEl.textContent = `${currentIndex + 1}/${questions.length}`;
  yesButton.textContent = current.yes;
  noButton.textContent = current.no;
  noButton.style.transform = "translate(0, 0)";
};

const moveNoButton = () => {
  const maxX = 200;
  const maxY = 120;
  const randomX = Math.floor(Math.random() * maxX - maxX / 2);
  const randomY = Math.floor(Math.random() * maxY - maxY / 2);
  noButton.style.transform = `translate(${randomX}px, ${randomY}px)`;
};

const showResult = () => {
  questionSection.hidden = true;
  result.hidden = false;
};

const reset = () => {
  currentIndex = 0;
  questionSection.hidden = false;
  result.hidden = true;
  updateQuestion();
};

yesButton.addEventListener("click", () => {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    updateQuestion();
    return;
  }
  showResult();
});

noButton.addEventListener("mouseenter", moveNoButton);
noButton.addEventListener("click", moveNoButton);
noButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
});

restartButton.addEventListener("click", reset);

updateQuestion();
