const questions = [
  {
    text: "Will you be my Valentine, Elza?",
    yes: "Yes, obviously 💖",
    no: "Nope",
  },
  {
    text: "Do you accept unlimited goofy memes from me?",
    yes: "I accept the memes",
    no: "Too many memes",
  },
  {
    text: "Can I reserve a lifetime of hand-holding?",
    yes: "Yes, hold my hand",
    no: "Hands are busy",
  },
];

const questionEl = document.getElementById("question");
const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");
const result = document.getElementById("result");
const questionSection = document.querySelector(".question");
const restartButton = document.getElementById("restart-button");

let currentIndex = 0;

const updateQuestion = () => {
  const current = questions[currentIndex];
  questionEl.textContent = current.text;
  yesButton.textContent = current.yes;
  noButton.textContent = current.no;
  noButton.style.transform = "translate(0, 0)";
};

const moveNoButton = () => {
  const maxX = 180;
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
