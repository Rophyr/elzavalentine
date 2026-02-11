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

const playerSection = document.getElementById("player");
const audioPlayer = document.getElementById("audio-player");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const seekBar = document.getElementById("seek-bar");
const volumeBar = document.getElementById("volume-bar");
const prevTrackButton = document.getElementById("prev-track");
const playPauseButton = document.getElementById("play-pause");
const nextTrackButton = document.getElementById("next-track");

let currentIndex = 0;
let dodgeCount = 0;
let songs = [];
let songIndex = 0;
let isPlayerLoaded = false;

const fallbackSongs = [
  {
    trackName: "Apocalypse (Preview)",
    artistName: "Cigarettes After Sex",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/8b/25/8f/8b258fa0-cfdb-cfdf-7130-29ce6c53f6f4/mzaf_13673487231308968494.plus.aac.p.m4a",
  },
  {
    trackName: "K. (Preview)",
    artistName: "Cigarettes After Sex",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/e7/a4/0d/e7a40d6d-5885-b040-c691-3cd59ad949f8/mzaf_17437565227666971879.plus.aac.p.m4a",
  },
  {
    trackName: "Nothing's Gonna Hurt You Baby (Preview)",
    artistName: "Cigarettes After Sex",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/84/30/30/84303045-8905-d2e8-f6fe-0fb525f77948/mzaf_17230553310342602852.plus.aac.p.m4a",
  },
];

const setStatus = (text) => {
  statusLine.textContent = text;
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
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

  const progressBar = document.querySelector(".progress-bar");
  progressBar.setAttribute("aria-valuenow", String(currentIndex + 1));
};

const moveNoButton = () => {
  if (noButton.classList.contains("caught")) {
    return;
  }

  const areaRect = answersArea.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const maxX = Math.max(0, areaRect.width - buttonRect.width);
  const maxY = Math.max(0, areaRect.height - buttonRect.height);

  const nextX = Math.floor(Math.random() * maxX);
  const nextY = Math.floor(Math.random() * maxY);

  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;
  noButton.classList.add("shake");
  setTimeout(() => noButton.classList.remove("shake"), 220);
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
  dodgeCount = 0;
  questionSection.hidden = false;
  result.hidden = true;
  updateQuestion();
  setStatus("placeholder reset status");
};

const loadTrack = (index) => {
  if (!songs.length) {
    return;
  }

  const safeIndex = (index + songs.length) % songs.length;
  songIndex = safeIndex;
  const track = songs[safeIndex];

  audioPlayer.src = track.previewUrl;
  trackTitle.textContent = track.trackName;
  trackArtist.textContent = track.artistName;
  playPauseButton.textContent = "play";
  seekBar.value = "0";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
};

const togglePlayback = async () => {
  if (!audioPlayer.src) {
    return;
  }

  if (audioPlayer.paused) {
    try {
      await audioPlayer.play();
      playPauseButton.textContent = "pause";
      setStatus("placeholder playback started status");
    } catch {
      setStatus("placeholder playback blocked status");
    }
  } else {
    audioPlayer.pause();
    playPauseButton.textContent = "play";
    setStatus("placeholder playback paused status");
  }
};

const fetchCASSongs = async () => {
  const endpoint = "https://itunes.apple.com/search?term=cigarettes+after+sex&entity=song&limit=12";
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("failed to fetch songs");
  }

  const payload = await response.json();
  return payload.results.filter((item) => item.previewUrl).slice(0, 8);
};

const initPlaylist = async () => {
  playlistButton.disabled = true;
  playlistButton.textContent = "playlist: loading...";

  try {
    const fetched = await fetchCASSongs();
    songs = fetched.length ? fetched : fallbackSongs;
    setStatus("placeholder playlist loaded status");
  } catch {
    songs = fallbackSongs;
    setStatus("placeholder playlist fallback status");
  }

  isPlayerLoaded = true;
  playerSection.hidden = false;
  loadTrack(0);
  playlistButton.disabled = false;
  playlistButton.textContent = "playlist: ready";
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
answersArea.addEventListener("mousemove", (event) => {
  if (noButton.classList.contains("caught")) {
    return;
  }

  const rect = noButton.getBoundingClientRect();
  const close =
    event.clientX > rect.left - 65 &&
    event.clientX < rect.right + 65 &&
    event.clientY > rect.top - 65 &&
    event.clientY < rect.bottom + 65;

  if (close) {
    moveNoButton();
  }
});

noButton.addEventListener("pointerdown", (event) => {
  if (noButton.classList.contains("caught")) {
    return;
  }

  dodgeCount += 1;
  const shouldDodge = dodgeCount % 5 !== 0;
  if (shouldDodge) {
    event.preventDefault();
    moveNoButton();
    setStatus("placeholder no dodged status");
  }
});

noButton.addEventListener("click", () => {
  if (noButton.classList.contains("caught")) {
    return;
  }

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

playlistButton.addEventListener("click", async () => {
  if (!isPlayerLoaded) {
    await initPlaylist();
    return;
  }

  playerSection.hidden = !playerSection.hidden;
  playlistButton.textContent = playerSection.hidden ? "playlist: show" : "playlist: hide";
  setStatus("placeholder playlist toggle status");
});

playPauseButton.addEventListener("click", togglePlayback);

prevTrackButton.addEventListener("click", () => {
  loadTrack(songIndex - 1);
  togglePlayback();
});

nextTrackButton.addEventListener("click", () => {
  loadTrack(songIndex + 1);
  togglePlayback();
});

seekBar.addEventListener("input", () => {
  if (!audioPlayer.duration) {
    return;
  }
  const ratio = Number(seekBar.value) / 100;
  audioPlayer.currentTime = ratio * audioPlayer.duration;
});

volumeBar.addEventListener("input", () => {
  audioPlayer.volume = Number(volumeBar.value);
});

audioPlayer.addEventListener("timeupdate", () => {
  if (!audioPlayer.duration) {
    return;
  }
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  seekBar.value = String(progress);
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
  durationEl.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener("ended", () => {
  loadTrack(songIndex + 1);
  togglePlayback();
});

updateQuestion();
setStatus("placeholder ready status");
