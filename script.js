const audio = document.getElementById("bg-audio"),
  audioToggle = document.getElementById("audio-toggle");
let audioPlaying = false;
document.addEventListener(
  "click",
  function s() {
    audio
      .play()
      .then(() => {
        audioPlaying = true;
        audioToggle.textContent = "🔊";
      })
      .catch(() => {});
  },
  { once: true },
);
audioToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  if (audioPlaying) {
    audio.pause();
    audioToggle.textContent = "🔇";
    audioPlaying = false;
  } else {
    audio.play();
    audioToggle.textContent = "🔊";
    audioPlaying = true;
  }
});
window.addEventListener("load", () =>
  setTimeout(
    () => document.getElementById("loader").classList.add("hidden"),
    1500,
  ),
);

const canvas = document.getElementById("dna-canvas"),
  ctx = canvas.getContext("2d");
let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const facts = [
  "You share 60% DNA with a banana!",
  "Human DNA is 99.9% identical between people",
  "If unwound, your DNA would stretch to Pluto and back",
  "Your genome has 3.2 billion base pairs",
  "DNA can survive for over 1 million years",
  "Genes make up only 2% of human DNA",
  "You get half your DNA from each parent",
  "Octopuses can edit their own RNA",
  "A single cell's DNA = 2 meters long",
  "Humans have about 20,000-25,000 genes",
];
const basePairs = [
  { a: "A", b: "T", colorA: "#EE9B00", colorB: "#AE2012" },
  { a: "G", b: "C", colorA: "#0A9396", colorB: "#94D2BD" },
];
let scrollY = 0,
  mutated = false,
  rnaMode = false,
  time = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

function drawHelix() {
  requestAnimationFrame(drawHelix);
  time++;
  ctx.fillStyle = "#001219";
  ctx.fillRect(0, 0, W, H);
  const progress = scrollY / (document.body.scrollHeight - H);
  const bpCount = Math.floor(progress * 3200000000);
  document.getElementById("bp-count").textContent = bpCount.toLocaleString();
  const factIdx = Math.floor(progress * facts.length) % facts.length;
  document.getElementById("current-fact").textContent = facts[factIdx];

  const cx = W / 2,
    totalRungs = 40,
    rungSpacing = 25;
  const rotation = time * 0.02 + scrollY * 0.01;
  const unzipPoint = progress * totalRungs * 0.8;

  for (let i = 0; i < totalRungs; i++) {
    const y = H / 2 + (i - totalRungs / 2) * rungSpacing - scrollY * 0.3;
    if (y < -50 || y > H + 50) continue;
    const angle = rotation + i * 0.5;
    const radius = 80 + Math.sin(i * 0.3) * 10;
    const x1 = cx + Math.cos(angle) * radius;
    const x2 = cx + Math.cos(angle + Math.PI) * radius;
    const depth1 = Math.sin(angle);
    const depth2 = Math.sin(angle + Math.PI);
    const bp = basePairs[i % 2];
    const unzipped = i < unzipPoint;
    const separation = unzipped ? 30 + Math.sin(time * 0.05) * 5 : 0;

    ctx.globalAlpha = 0.5 + Math.abs(depth1) * 0.5;
    const glow1 = ctx.createRadialGradient(
      x1 - separation,
      y,
      0,
      x1 - separation,
      y,
      15,
    );
    glow1.addColorStop(
      0,
      mutated ? `hsl(${(i * 30 + time) % 360},80%,60%)` : bp.colorA,
    );
    glow1.addColorStop(1, "transparent");
    ctx.fillStyle = glow1;
    ctx.fillRect(x1 - separation - 15, y - 15, 30, 30);
    ctx.beginPath();
    ctx.arc(x1 - separation, y, 6 + Math.abs(depth1) * 4, 0, Math.PI * 2);
    ctx.fillStyle = mutated
      ? `hsl(${(i * 30 + time) % 360},80%,60%)`
      : bp.colorA;
    ctx.fill();

    ctx.globalAlpha = 0.5 + Math.abs(depth2) * 0.5;
    const glow2 = ctx.createRadialGradient(
      x2 + separation,
      y,
      0,
      x2 + separation,
      y,
      15,
    );
    glow2.addColorStop(
      0,
      mutated ? `hsl(${(i * 30 + time + 180) % 360},80%,60%)` : bp.colorB,
    );
    glow2.addColorStop(1, "transparent");
    ctx.fillStyle = glow2;
    ctx.fillRect(x2 + separation - 15, y - 15, 30, 30);
    ctx.beginPath();
    ctx.arc(x2 + separation, y, 6 + Math.abs(depth2) * 4, 0, Math.PI * 2);
    ctx.fillStyle = mutated
      ? `hsl(${(i * 30 + time + 180) % 360},80%,60%)`
      : bp.colorB;
    ctx.fill();

    if (!unzipped) {
      ctx.globalAlpha = 0.15 + Math.abs(depth1) * 0.15;
      ctx.strokeStyle = bp.colorA;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    if (Math.abs(depth1) > 0.7) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 10px Exo 2";
      ctx.textAlign = "center";
      ctx.fillText(
        rnaMode ? (bp.a === "T" ? "U" : bp.a) : bp.a,
        x1 - separation,
        y + 3,
      );
      ctx.fillText(
        rnaMode ? (bp.b === "T" ? "U" : bp.b) : bp.b,
        x2 + separation,
        y + 3,
      );
    }
    ctx.globalAlpha = 1;
  }

  for (let s = 0; s < 2; s++) {
    ctx.beginPath();
    ctx.strokeStyle = s === 0 ? "rgba(148,210,189,0.3)" : "rgba(238,155,0,0.3)";
    ctx.lineWidth = 2;
    for (let i = 0; i < totalRungs; i++) {
      const y = H / 2 + (i - totalRungs / 2) * rungSpacing - scrollY * 0.3;
      const angle = rotation + i * 0.5 + (s === 1 ? Math.PI : 0);
      const radius = 80 + Math.sin(i * 0.3) * 10;
      const x = cx + Math.cos(angle) * radius;
      const unzipped = i < unzipPoint;
      const sep = unzipped ? (s === 0 ? -30 : 30) : 0;
      if (i === 0) ctx.moveTo(x + sep, y);
      else ctx.lineTo(x + sep, y);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 20; i++) {
    const px = Math.sin(time * 0.001 + i * 1.3) * W * 0.4 + cx;
    const py = (time * 0.5 + i * 100) % H;
    ctx.fillStyle = `rgba(148,210,189,${0.1 + Math.sin(time * 0.01 + i) * 0.05})`;
    ctx.beginPath();
    ctx.arc(px, py, 1 + Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
}

document.getElementById("mutate-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  mutated = !mutated;
});
document.getElementById("mode-toggle").addEventListener("click", (e) => {
  e.stopPropagation();
  rnaMode = !rnaMode;
  e.target.textContent = rnaMode ? "RNA → DNA" : "DNA → RNA";
});
drawHelix();
