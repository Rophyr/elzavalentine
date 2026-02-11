const questions = [
  {
    text: "I love seeing you improve at everything you do. League, French, your mindset, all of it. You're doing amazing and I'm proud of you every day.",
    yes: "that means a lot 💜",
    no: "no",
  },
  {
    text: "The affection I have for you is huge. You're my future, and I'll be yours.",
    yes: "yes, future us",
    no: "hmm no",
  },
  { text: "3rd page — to be written soon.", yes: "continue", no: "nope" },
  { text: "4th page — to be written soon.", yes: "continue", no: "not really" },
  { text: "5th page — to be written soon.", yes: "finish", no: "let me think" },
];

const tracks = [
  { title: "Apocalypse", artist: "Cigarettes After Sex", videoId: "sElE_BfQ67s" },
  { title: "K.", artist: "Cigarettes After Sex", videoId: "L4sbDxR22z4" },
  { title: "Nothing's Gonna Hurt You Baby", artist: "Cigarettes After Sex", videoId: "QI8VrXkffcg" },
];

const intro = document.getElementById("intro");
const enterButton = document.getElementById("enter-site");
const mainCard = document.getElementById("main-card");

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
const ambientHearts = document.getElementById("ambient-hearts");

const playerSection = document.getElementById("player");
const ytHolder = document.getElementById("yt-holder");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const seekBar = document.getElementById("seek-bar");
const volumeBar = document.getElementById("volume-bar");
const prevTrackButton = document.getElementById("prev-track");
const playPauseButton = document.getElementById("play-pause");
const nextTrackButton = document.getElementById("next-track");
const loveFill = document.getElementById("love-fill");

let currentIndex = 0;
let dodgeCount = 0;
let playerReady = false;
let playlistReady = false;
let currentTrackIndex = 0;
let isSeeking = false;
let ytPlayer = null;
let tickInterval;

const setStatus = (text) => {
  statusLine.textContent = text;
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const updateQuestion = () => {
  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  questionEl.textContent = q.text;
  yesButton.textContent = q.yes;
  noButton.textContent = q.no;
  questionCountEl.textContent = `${currentIndex + 1}/${questions.length}`;
  progressFill.style.width = `${progress}%`;
  loveFill.style.width = `${Math.min(100, 20 + currentIndex * 20)}%`;
  noButton.classList.remove("caught");

  document.querySelector(".progress-bar").setAttribute("aria-valuenow", String(currentIndex + 1));
};

const moveNoButton = () => {
  if (noButton.classList.contains("caught")) {
    return;
  }

  const areaRect = answersArea.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const maxX = Math.max(0, areaRect.width - buttonRect.width);
  const maxY = Math.max(0, areaRect.height - buttonRect.height);

  const currentLeft = Number.parseFloat(noButton.style.left || "150") || 150;
  const currentTop = Number.parseFloat(noButton.style.top || "0") || 0;

  const stepX = Math.floor(Math.random() * 180 - 90);
  const stepY = Math.floor(Math.random() * 120 - 60);

  const nextX = Math.min(maxX, Math.max(0, currentLeft + stepX));
  const nextY = Math.min(maxY, Math.max(0, currentTop + stepY));

  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;
};

const spawnHearts = (count = 10) => {
  const icons = ["💗", "💘", "💞", "✨", "🌸"];
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = icons[Math.floor(Math.random() * icons.length)];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.animationDuration = `${3 + Math.random() * 3}s`;
    piece.style.opacity = `${0.55 + Math.random() * 0.35}`;
    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 7000);
  }
};

const spawnAmbientHeart = () => {
  const icons = ["💗", "💞", "✨"];
  const piece = document.createElement("span");
  piece.className = "ambient-heart";
  piece.textContent = icons[Math.floor(Math.random() * icons.length)];
  piece.style.left = `${Math.random() * 100}vw`;
  piece.style.animationDuration = `${8 + Math.random() * 7}s`;
  piece.style.opacity = `${0.14 + Math.random() * 0.22}`;
  ambientHearts.appendChild(piece);
  setTimeout(() => piece.remove(), 17000);
};

const startAmbientHearts = () => {
  setInterval(() => {
    spawnAmbientHeart();
  }, 900);
};

const showResult = () => {
  questionSection.hidden = true;
  result.hidden = false;
  spawnHearts(16);
  setStatus("You reached the official yes ending.");
};

const resetFlow = () => {
  currentIndex = 0;
  dodgeCount = 0;
  questionSection.hidden = false;
  result.hidden = true;
  updateQuestion();
  setStatus("Back to question one.");
};

const applyTrackInfo = () => {
  const track = tracks[currentTrackIndex];
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
};

const loadTrack = (index, autoplay = false) => {
  if (!ytPlayer || !playerReady) {
    return;
  }
  currentTrackIndex = (index + tracks.length) % tracks.length;
  applyTrackInfo();
  ytPlayer.loadVideoById(tracks[currentTrackIndex].videoId);
  if (!autoplay) {
    ytPlayer.pauseVideo();
  }
};

const startTicker = () => {
  clearInterval(tickInterval);
  tickInterval = setInterval(() => {
    if (!ytPlayer || !playerReady || isSeeking) {
      return;
    }

    const duration = ytPlayer.getDuration?.() || 0;
    const current = ytPlayer.getCurrentTime?.() || 0;
    currentTimeEl.textContent = formatTime(current);
    durationEl.textContent = formatTime(duration);
    if (duration > 0) {
      seekBar.value = String((current / duration) * 100);
    }
  }, 250);
};

const togglePlayback = () => {
  if (!ytPlayer || !playerReady) {
    return;
  }
  const state = ytPlayer.getPlayerState();
  if (state === window.YT?.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
    playPauseButton.textContent = "play";
    setStatus("Paused.");
  } else {
    ytPlayer.playVideo();
    playPauseButton.textContent = "pause";
    setStatus("Playing Cigarettes After Sex.");
  }
};

const createYouTubePlayer = () => {
  if (ytPlayer || !window.YT || !window.YT.Player) {
    return;
  }

  ytPlayer = new window.YT.Player(ytHolder, {
    height: "1",
    width: "1",
    videoId: tracks[0].videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
    },
    events: {
      onReady: () => {
        playerReady = true;
        ytPlayer.setVolume(Number(volumeBar.value));
        applyTrackInfo();
        startTicker();
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.ENDED) {
          loadTrack(currentTrackIndex + 1, true);
        }
      },
    },
  });
};

window.onYouTubeIframeAPIReady = () => {
  createYouTubePlayer();
};

enterButton.addEventListener("click", () => {
  document.body.classList.remove("loading");
  mainCard.hidden = false;
  intro.hidden = true;
  setStatus("Ready when you are 💫");
});

yesButton.addEventListener("click", () => {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    updateQuestion();
    setStatus("Nice. Next question.");
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
    event.clientX > rect.left - 60 &&
    event.clientX < rect.right + 60 &&
    event.clientY > rect.top - 60 &&
    event.clientY < rect.bottom + 60;

  if (close && Math.random() < 0.25) {
    moveNoButton();
  }
});

noButton.addEventListener("pointerdown", (event) => {
  if (noButton.classList.contains("caught")) {
    return;
  }
  dodgeCount += 1;
  const letClickThrough = dodgeCount % 2 === 0;
  if (!letClickThrough) {
    event.preventDefault();
    moveNoButton();
    setStatus("Close one 😌");
  }
});

noButton.addEventListener("click", () => {
  if (noButton.classList.contains("caught")) {
    return;
  }
  noButton.classList.add("caught");
  noButton.textContent = "You meant yes";
  setStatus("I knew it 😌");
  spawnHearts(8);
});

restartButton.addEventListener("click", resetFlow);

const syncThemeIcon = () => {
  themeToggle.textContent = document.body.classList.contains("dark") ? "🌙" : "☀️";
};

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  syncThemeIcon();
  setStatus("Theme toggled.");
});

sparkleButton.addEventListener("click", () => {
  spawnHearts(14);
  setStatus("Extra hearts deployed.");
});

playlistButton.addEventListener("click", () => {
  if (!playlistReady) {
    playlistReady = true;
    playerSection.hidden = false;
    createYouTubePlayer();
    setStatus("CAS playlist loaded (full songs). ");
    playlistButton.textContent = "hide playlist";
    return;
  }
  playerSection.hidden = !playerSection.hidden;
  playlistButton.textContent = playerSection.hidden ? "show playlist" : "hide playlist";
  setStatus("Playlist toggled.");
});

playPauseButton.addEventListener("click", togglePlayback);
prevTrackButton.addEventListener("click", () => loadTrack(currentTrackIndex - 1, true));
nextTrackButton.addEventListener("click", () => loadTrack(currentTrackIndex + 1, true));

seekBar.addEventListener("pointerdown", () => {
  isSeeking = true;
});
seekBar.addEventListener("pointerup", () => {
  if (!ytPlayer || !playerReady) {
    return;
  }
  const duration = ytPlayer.getDuration?.() || 0;
  const nextTime = (Number(seekBar.value) / 100) * duration;
  ytPlayer.seekTo(nextTime, true);
  isSeeking = false;
});

volumeBar.addEventListener("input", () => {
  if (!ytPlayer || !playerReady) {
    return;
  }
  ytPlayer.setVolume(Number(volumeBar.value));
});

updateQuestion();
syncThemeIcon();
startAmbientHearts();
setStatus("Happy Valentine’s Day, Elza 💜");

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !document.body.classList.contains("loading") && !result.hidden) {
    resetFlow();
  }
});
