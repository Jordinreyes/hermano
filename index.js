
const memories = [
  {
    image: "Pictures/foto_3.png",
    title: "Nuestros primeros recuerdos.",
    text: "Hay fotografías que guardan mucho más que una imagen: guardan risas, abrazos y una historia que siempre llevaremos con nosotros."
  },
  {
    image: "Pictures/foto_2.jpeg",
    title: "Los días que nos hicieron reír.",
    text: "Esos momentos espontáneos que no se planean y terminan convirtiéndose en las anécdotas que contamos una y otra vez."
  },
  {
    image: "Pictures/foto_4.jpeg",
    title: "La familia, nuestro lugar seguro.",
    text: "No importa cuánto tiempo pase ni a dónde nos lleve la vida: siempre tendremos una historia en común y un lugar al que volver."
  },
  {
    image: "Pictures/foto_1.png",
    title: "Pequeños instantes, grandes recuerdos.",
    text: "Cada instante a tu lado se convierte en un recuerdo especial. Gracias por tantas risas, momentos y por ser parte de mi vida. Pase lo que pase, siempre estaremos juntos. Te amo, gordo."
  },
  {
    image: "Pictures/foto_5.png",
    title: "Y todos los que aún nos quedan.",
    text: "Por muchas más aventuras, abrazos y recuerdos juntos. Lo mejor de todo es lo que aún nos queda por vivir Imagen creada con IA jaja."
  }
];

const $ = (id) => document.getElementById(id);
let current = 0;

// MOSTRAR LOS RECUERDOS

function render() {
  const i = current;
  const memory = memories[i];
  const number = String(i + 1).padStart(2, "0");
  const total = String(memories.length).padStart(2, "0");

  $("memoryCounter").textContent = `${number} / ${total}`;
  $("memoryTitle").textContent = memory.title;
  $("memoryText").textContent = memory.text;
  $("memoryLabel").textContent = `Recuerdo ${number}`;

  const visual = $("memoryVisual");
  const image = $("memoryImage");

  visual.dataset.tone = i + 1;
  visual.classList.remove("has-image");

  image.onload = () => {
    if (current === i) {
      visual.classList.add("has-image");
    }
  };

  image.onerror = () => {
    if (current === i) {
      visual.classList.remove("has-image");
    }
  };

  image.alt = `Foto familiar ${i + 1}: ${memory.title}`;
  image.src = memory.image;

  [...$("dots").children].forEach((dot, n) => {
    dot.classList.toggle("active", n === i);
    dot.setAttribute("aria-current", n === i ? "true" : "false");
  });
}

// INDICADORES DEL CARRUSEL

memories.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "dot";

  dot.setAttribute("aria-label", `Mostrar recuerdo ${i + 1}`);

  dot.onclick = () => {
    current = i;
    render();
  };

  $("dots").append(dot);
});

// FLECHAS DEL CARRUSEL

$("next").onclick = () => {
  current = (current + 1) % memories.length;
  render();
};

$("prev").onclick = () => {
  current = (current - 1 + memories.length) % memories.length;
  render();
};

// DESLIZAMIENTO EN MÓVILES

let startX = 0;
const card = $("memoryCard");

card.addEventListener("touchstart", (event) => {
  startX = event.touches[0].clientX;
}, { passive: true });

card.addEventListener("touchend", (event) => {
  const dx = event.changedTouches[0].clientX - startX;

  if (Math.abs(dx) > 55) {
    current = (
      current + (dx < 0 ? 1 : -1) + memories.length
    ) % memories.length;

    render();
  }
}, { passive: true });

// NAVEGACIÓN CON TECLADO

document.addEventListener("keydown", (event) => {
  if (document.activeElement?.tagName === "INPUT") return;

  if (location.hash === "#recuerdos" && event.key === "ArrowRight") {
    $("next").click();
  }

  if (location.hash === "#recuerdos" && event.key === "ArrowLeft") {
    $("prev").click();
  }
});

render();

// ANIMACIONES DE ENTRADA

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("seen");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".fadein").forEach((item) => {
    observer.observe(item);
  });
} else {
  document.querySelectorAll(".fadein").forEach((item) => {
    item.classList.add("seen");
  });
}

// CONFETI

const canvas = $("confetti");
const ctx = canvas.getContext("2d");

let pieces = [];
let raf = 0;

const colors = [
  "#b9705a",
  "#cbb593",
  "#8b9d8c",
  "#e1c8c0",
  "#eadfd0",
  "#8d8b88"
];

function sizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

window.addEventListener("resize", sizeCanvas);
sizeCanvas();

function burst() {
  cancelAnimationFrame(raf);

  pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.7,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 3,
    rot: Math.random() * 6.28,
    vr: (Math.random() - 0.5) * 0.15,
    w: 4 + Math.random() * 6,
    h: 7 + Math.random() * 8,
    c: colors[Math.floor(Math.random() * colors.length)],
    life: 0
  }));

  function step() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces.forEach((piece) => {
      piece.x += piece.vx + Math.sin(piece.life * 0.03) * 0.55;
      piece.y += piece.vy;
      piece.rot += piece.vr;
      piece.life++;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rot);
      ctx.fillStyle = piece.c;
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      ctx.restore();
    });

    pieces = pieces.filter((piece) =>
      piece.y < window.innerHeight + 30 && piece.life < 400
    );

    if (pieces.length) {
      raf = requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  step();
}

$("celebrate").onclick = burst;
