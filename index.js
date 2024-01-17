const rocket = document.querySelector("#rocket");
const sky = document.querySelector("#sky");
const ex = document.querySelector("#exhaust");
var bottom = 0;
var last_y = 0;
var wheel;

window.addEventListener("wheel", function (e) {
  wheel = e.deltaY;
});

window.addEventListener("scroll", function (e) {
  var h = window.innerHeight;
  var y = document.documentElement.scrollTop;
  var doc = document.body.offsetHeight - 250;
  var perc = y / (doc - h);
  // console.log(perc)

  if (perc < 1) {
    sky.style.bottom = -1 * perc * 100 + "%";
  }

  if (perc > 0) {
    rocket.classList.add("shake_rocket");
    ex.classList.add("exhaust");
  } else {
    rocket.classList.remove("shake_rocket");
    ex.classList.remove("exhaust");
  }

  if (perc > 0.37) {
    ex.classList.remove("exhaust");
  }

  if (perc > 0.25) {
    bottom = (perc - 0.25) * 133;
  }

  if (perc > 0) {
    bottom = (perc - 0.25) * 133;
    if (perc - 0.25 < 0) {
      bottom = 0;
    }
  }
  rocket.style.bottom = bottom + "%";

  last_y = y;
});

//fireworks
class Firework {
  constructor() {
    this.x = random(width);
    this.y = height;
    this.vx = random(-1, 1) * 3;
    this.vy = random(-10, -2) * 2;
    this.gravity = 0;
    this.trailColors = ["#ffa07a", "#ffd700", "#00bfff"];
    this.explosionColors = [
      "#e84e66",
      "#67c69e",
      "#edf1f4",
      "#80acc9",
      "#73a8b0",
      "#fe817f",
      "#68d2a4",
      "#1d203f",
      "#c9a30d",
    ];
    this.explosionSounds = [
      "https://www.fesliyanstudios.com/play-mp3/6967",
      "https://www.fesliyanstudios.com/play-mp3/6966",
      "https://www.fesliyanstudios.com/play-mp3/6968",
      "https://www.fesliyanstudios.com/play-mp3/6969",
      "https://www.fesliyanstudios.com/play-mp3/6975",
    ];
    this.exploded = false;
    this.particles = [];
    this.explodeHeight = random(height * 0.4, height * 0.8);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    if (!this.exploded && this.y <= this.explodeHeight) {
      this.explode();
    }

    this.particles.forEach((particle) => {
      particle.update();
    });
  }

  show() {
    if (!this.exploded) {
      stroke(255, 165, 0);
      strokeWeight(4);
      point(this.x, this.y);
    }

    this.particles.forEach((particle) => {
      particle.show();
    });
  }

  explode() {
    this.exploded = true;
    const numParticles = 100;
    const fadeSteps = 255 / numParticles;

    const soundIndex = floor(random(this.explosionSounds.length));
    const soundUrl = this.explosionSounds[soundIndex];
    const sound = new Audio(soundUrl);
    sound.play();

    for (let i = 0; i < numParticles; i++) {
      const particleColor = random(this.explosionColors);
      const particle = new Particle(this.x, this.y, particleColor);
      const angle = random(TWO_PI);
      const speed = random(0.2, 10); // Adjust the speed of the particles
      const vx = (speed * cos(angle)) / random(1, 1.5);
      const vy = (speed * sin(angle)) / random(1, 1.5);
      particle.setVelocity(vx, vy);
      particle.setFade(fadeSteps * i); // Set the fade level for the trail effect
      this.particles.push(particle);
    }
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = 0;
    this.vy = 0;
    this.alpha = 255;
    this.sparkling = true;
    this.sparkleCount = random(20, 40);
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  setFade(alpha) {
    this.alpha = alpha;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1;
    this.alpha -= 1;

    if (this.sparkling) {
      this.sparkleCount--;

      if (this.sparkleCount <= 0) {
        this.sparkling = false;
        this.alpha = 0;
      }
    }
  }

  show() {
    noStroke();
    if (this.sparkling) {
      const sparkleColor = color(
        red(this.color),
        green(this.color),
        blue(this.color),
        random(100, 255)
      );
      fill(sparkleColor);
    } else {
      fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    }
    ellipse(this.x, this.y, 8, 8);
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.opacity = random(100, 255);
    this.twinkleSpeed = random(0.01, 0.03);
  }

  update() {
    let twinkleVal = sin(frameCount * this.twinkleSpeed);
    this.opacity = map(twinkleVal, -1, 1, 100, 255);
  }

  display() {
    noStroke();
    fill(255, this.opacity);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

class Sparkle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = random(2, 8); // Increased sparkle size
    this.color = color;
    this.opacity = 255;
    this.speedX = random(-1, 1);
    this.speedY = random(-1, 1);
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 10;
  }

  display() {
    noStroke();
    fill(this.color, this.opacity);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

let fireworks = [];
let stars = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("fireworks");

  canvas.mouseClicked(launchFirework);
  canvas.touchStarted(launchFirework);

  frameRate(60);

  for (let i = 0; i < 200; i++) {
    let star = new Star();
    stars.push(star);
  }

  demo();
}

function demo() {
  launchFirework();
  launchFirework();
  launchFirework();
  launchFirework();
  launchFirework();
}

function draw() {
  clear(0);

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const firework = fireworks[i];
    firework.update();
    firework.show();

    if (
      firework.y > height ||
      (firework.exploded && firework.particles.length === 0)
    ) {
      fireworks.splice(i, 1);
    }
  }

  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
    stars[i].display();
  }
}

function launchFirework() {
  const firework = new Firework();
  fireworks.push(firework);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
let cor = document.querySelector("#correct");
cor.addEventListener("click", showAlert);

let kill = document.querySelector("#kills");
kill.addEventListener("click", showKills);

let slay = document.querySelector("#slays");
slay.addEventListener("click", showSlays);

// let firework = document.querySelector(".svg");
// firework.style.display = "none";

let sing = document.querySelector("#sings");
sing.addEventListener("click", showSings);

let form = document.querySelector(".form");
console.log(form);
form.style.display = "block";

let alien = document.querySelector(".ufo");
alien.style.display = "none";

function showAlert() {
  // firework.style.display = "block";
  alert(
    "Yay! You little Virgo Shooter That's The Way to Go! Keep it Up and Shoot For The Stars!"
  );
  form.style.display = "none";
  alien.style.display = "block";
}

function showKills() {
  alert("He rapes and kills some thing yes...keep searching");
}

function showSlays() {
  alert("He slays...sometimes...but keep looking for the right answer");
}

function showSings() {
  alert("He sings better than you but keep looking for the right answer");
}

alien.addEventListener("mousemove", (e) => {
  let eyes = document.querySelector(".eyes");
  let mouseX = eyes.getBoundingClientRect().left;
  let mouseY = eyes.getBoundingClientRect().top;
  let radianDegrees = Math.atan2(e.pageX - mouseX, e.pageY - mouseY);
  let rotationDegrees = radianDegrees * (180 / Math.PI) * -1 + 180;
  eyes.style.transform = `rotate(${rotationDegrees}deg)`;
});

function displayQuote(response) {
  new Typewriter("#quote", {
    strings: response.data.answer,
    autoStart: true,
    delay: 1,
  });
}

function generateQuote(event) {
  event.preventDefault();
  let apiKey = "a1184840edbfda3e40off6tdfda47219";
  let instructionsInput = document.querySelector("#user-instructions");
  let context =
    "You are a pop culture expert, and can remember quotes from anything be it book or movie or television show. your mission is to generate a new quote every time. Please make sure to follow the user instructions. only quote characters from the book television show or movie.";
  let prompt = `user instructions: Please generate a quote from ${instructionsInput.value}`;
  let apiUrl = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=${context}&key=${apiKey}`;
  let quoteElement = document.querySelector("#quote");
  quoteElement.classList.remove("hidden");
  quoteElement.innerHTML = `<div class="generating">⏳Generating a quote about ${instructionsInput.value} </div>`;

  axios.get(apiUrl).then(displayQuote);
}
let quoteFormElement = document.querySelector("#quote-generator-form");
quoteFormElement.addEventListener("submit", generateQuote);
