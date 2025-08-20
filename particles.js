/* Floating Particles + Bitcoin Icons Background */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.setAttribute("id", "bgCanvas");
  const ctx = canvas.getContext("2d");

  let particles = [];
  let btcLogos = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // Particle class
  class Particle {
    constructor(x, y, r, speed) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.speed = speed;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();
    }
    update() {
      this.y += this.speed;
      if (this.y > h) {
        this.y = 0;
        this.x = Math.random() * w;
      }
      this.draw();
    }
  }

  // Bitcoin Logo class
  class BitcoinLogo {
    constructor(x, y, size, speed) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.speed = speed;
    }
    draw() {
      ctx.beginPath();
      ctx.font = `${this.size}px Arial`;
      ctx.fillStyle = "#f1c40f";
      ctx.fillText("₿", this.x, this.y);
    }
    update() {
      this.y += this.speed;
      if (this.y > h) {
        this.y = 0;
        this.x = Math.random() * w;
      }
      this.draw();
    }
  }

  // Init particles
  function init() {
    particles = [];
    btcLogos = [];
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle(Math.random() * w, Math.random() * h, Math.random() * 3, 1 + Math.random() * 2));
    }
    for (let i = 0; i < 15; i++) {
      btcLogos.push(new BitcoinLogo(Math.random() * w, Math.random() * h, 18 + Math.random() * 12, 1 + Math.random()));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => p.update());
    btcLogos.forEach(b => b.update());
    requestAnimationFrame(animate);
  }

  init();
  animate();
});
