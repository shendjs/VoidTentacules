window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback);
    }
  );
});

function init(elemid) {
  let canvas = document.getElementById(elemid),
    c = canvas.getContext("2d"),
    w = (canvas.width = window.innerWidth),
    h = (canvas.height = window.innerHeight);
  c.fillStyle = "rgba(0,0,0,1)";
  c.fillRect(0, 0, w, h);
  return {c:c,canvas:canvas};
}

window.onload = function() {
  let c = init("canvas").c,
    canvas = init("canvas").canvas,
    w = (canvas.width = window.innerWidth),
    h = (canvas.height = window.innerHeight),
    mouse = { x: false, y: false },
    last_mouse = {};

  // New variables
  let bgStars = [];
  let pulseEffects = [];
  
  // Create background stars
  for(let i = 0; i < 150; i++) {
    bgStars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5,
      opacity: Math.random() * 0.5 + 0.2
    });
  }

  //initiation
  function dist(p1x, p1y, p2x, p2y) {
    return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
  }

  class segment {
    constructor(parent, l, a, first) {
      this.first = first;
      if (first) {
        this.pos = {
          x: parent.x,
          y: parent.y
        };
      } else {
        this.pos = {
          x: parent.nextPos.x,
          y: parent.nextPos.y
        };
      }
      this.l = l;
      this.ang = a;
      this.nextPos = {
        x: this.pos.x + this.l * Math.cos(this.ang),
        y: this.pos.y + this.l * Math.sin(this.ang)
      };
    }
    update(t) {
      this.ang = Math.atan2(t.y - this.pos.y, t.x - this.pos.x);
      this.pos.x = t.x + this.l * Math.cos(this.ang - Math.PI);
      this.pos.y = t.y + this.l * Math.sin(this.ang - Math.PI);
      this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
      this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
    }
    fallback(t) {
      this.pos.x = t.x;
      this.pos.y = t.y;
      this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
      this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
    }
    show() {
      c.lineTo(this.nextPos.x, this.nextPos.y);
    }
  }

  class tentacle {
    constructor(x, y, l, n, a) {
      this.x = x;
      this.y = y;
      this.l = l;
      this.n = n;
      this.t = {};
      this.rand = Math.random();
      this.segments = [new segment(this, this.l / this.n, 0, true)];
      for (let i = 1; i < this.n; i++) {
        this.segments.push(
          new segment(this.segments[i - 1], this.l / this.n, 0, false)
        );
      }
      // Change for black and white theme - gray tone value
      this.grayValue = Math.floor(Math.random() * 40) + 180; // Gray tones between 180-220
      this.pulseOffset = Math.random() * 5; // Offset for pulsation
    }

    move(last_target, target) {
      this.angle = Math.atan2(target.y-this.y,target.x-this.x);
      this.dt = dist(last_target.x, last_target.y, target.x, target.y)+5;
      this.t = {
        x: target.x - 0.8*this.dt*Math.cos(this.angle),
        y: target.y - 0.8*this.dt*Math.sin(this.angle)
      };
      //update first segment to follow target
      if(this.t.x){
        this.segments[this.n - 1].update(this.t);
      }else{
        this.segments[this.n - 1].update(target);
      }
      for (let i = this.n - 2; i >= 0; i--) {
        //update rest to follow segment in front of current segment
        this.segments[i].update(this.segments[i + 1].pos);
      }
      if (
        dist(this.x, this.y, target.x, target.y) <=
        this.l + dist(last_target.x, last_target.y, target.x, target.y)
      ) {
        this.segments[0].fallback({ x: this.x, y: this.y });
        for (let i = 1; i < this.n; i++) {
          this.segments[i].fallback(this.segments[i - 1].nextPos);
        }
      }
    }
    
    show(target) {
      if (dist(this.x, this.y, target.x, target.y) <= this.l) {
        c.globalCompositeOperation = "lighter";
        c.beginPath();
        c.lineTo(this.x, this.y);
        for (let i = 0; i < this.n; i++) {
          this.segments[i].show();
        }
        
        // Time-based gray tone fluctuation
        let grayValue = (this.grayValue + Math.sin(t * 0.8 + this.pulseOffset) * 15);
        
        // Brightness adjustment based on distance
        let targetDist = dist(this.x, this.y, target.x, target.y);
        let brightness = this.rand * 60 + 25;
        
        // Tentacles near target are brighter
        if (targetDist < this.l * 0.5) {
          brightness += 20 * (1 - targetDist / (this.l * 0.5));
        }
        
        c.strokeStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        c.lineWidth = this.rand * 2;
        c.lineCap = "round";
        c.lineJoin = "round";
        c.stroke();
        
        // Glowing points on tentacles (at segment connections)
        if (targetDist < this.l * 0.7 && Math.random() > 0.85) {
          let glowSegment = Math.floor(Math.random() * this.n);
          if (glowSegment < this.segments.length) {
            c.beginPath();
            c.arc(
              this.segments[glowSegment].nextPos.x,
              this.segments[glowSegment].nextPos.y,
              this.rand * 3,
              0,
              Math.PI * 2
            );
            c.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.3})`;
            c.fill();
          }
        }
        
        c.globalCompositeOperation = "source-over";
      }
    }
    
    show2(target) {
      c.beginPath();
      if (dist(this.x, this.y, target.x, target.y) <= this.l) {
        // Vibrating size
        let size = 2 * this.rand + 1 + Math.sin(t * 2 + this.pulseOffset) * 0.5;
        c.arc(this.x, this.y, size, 0, 2 * Math.PI);
        c.fillStyle = "white";
      } else {
        c.arc(this.x, this.y, this.rand * 2, 0, 2 * Math.PI);
        // Gray tones
        let grayValue = (this.grayValue - 100 + Math.sin(t + this.pulseOffset) * 10);
        c.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      }
      c.fill();
    }
  }

  let maxl = 230,
    minl = 30,
    n = 20,
    numt = 500,
    tent = [],
    clicked = false,
    target = { x: 0, y: 0 },
    last_target = {},
    t = 0,
    q = 10;

  for (let i = 0; i < numt; i++) {
    tent.push(
      new tentacle(
        Math.random() * w,
        Math.random() * h,
        Math.random() * (maxl - minl) + minl,
        n,
        Math.random() * 2 * Math.PI
      )
    );
  }
  
  // Function to create pulse effect
  function createPulse(x, y) {
    pulseEffects.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: 80 + Math.random() * 50,
      opacity: 0.7,
      grayValue: Math.floor(Math.random() * 40) + 200 // Gray tone for black and white theme
    });
  }
  
  function draw() {
    //animation
    if (mouse.x) {
      target.errx = mouse.x - target.x;
      target.erry = mouse.y - target.y;
      
      // Fast mouse movement detection and pulse effect creation
      if (Math.hypot(target.errx, target.erry) > 30 && Math.random() > 0.9) {
        createPulse(target.x, target.y);
      }
    } else {
      target.errx =
        w / 2 +
        (h / 2 - q) *
          Math.sqrt(2) *
          Math.cos(t) /
          (Math.pow(Math.sin(t), 2) + 1) -
        target.x;
      target.erry =
        h / 2 +
        (h / 2 - q) *
          Math.sqrt(2) *
          Math.cos(t) *
          Math.sin(t) /
          (Math.pow(Math.sin(t), 2) + 1) -
        target.y;
    }

    target.x += target.errx / 10;
    target.y += target.erry / 10;

    t += 0.01;
    
    // Black background
    c.fillStyle = "rgba(0, 0, 0, 0.2)";
    c.fillRect(0, 0, w, h);
    
    // Background stars
    for (let i = 0; i < bgStars.length; i++) {
      let star = bgStars[i];
      
      // Flickering stars
      let flicker = Math.sin(t * 2 + i) * 0.2 + 0.8;
      
      c.beginPath();
      c.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      c.fillStyle = `rgba(255, 255, 255, ${star.opacity * flicker})`;
      c.fill();
    }
    
    // Pulse effects
    for (let i = 0; i < pulseEffects.length; i++) {
      let pulse = pulseEffects[i];
      
      c.beginPath();
      c.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
      c.strokeStyle = `rgba(${pulse.grayValue}, ${pulse.grayValue}, ${pulse.grayValue}, ${pulse.opacity})`;
      c.lineWidth = 2;
      c.stroke();
      
      // Pulse update
      pulse.radius += 2;
      pulse.opacity -= 0.015;
      
      // Remove finished pulse effects
      if (pulse.opacity <= 0 || pulse.radius >= pulse.maxRadius) {
        pulseEffects.splice(i, 1);
        i--;
      }
    }
    
    // Main target circle
    c.beginPath();
    c.arc(target.x, target.y, dist(last_target.x, last_target.y, target.x, target.y) + 5, 0, 2 * Math.PI);
    
    // Gradient fill (black and white)
    let glow = c.createRadialGradient(target.x, target.y, 0, target.x, target.y, 30);
    glow.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    glow.addColorStop(0.5, "rgba(180, 180, 180, 0.4)");
    glow.addColorStop(1, "rgba(100, 100, 100, 0)");
    c.fillStyle = glow;
    c.fill();

    for (i = 0; i < numt; i++) {
      tent[i].move(last_target, target);
      tent[i].show2(target);
    }
    for (i = 0; i < numt; i++) {
      tent[i].show(target);
    }
    last_target.x = target.x;
    last_target.y = target.y;
  }

  canvas.addEventListener(
    "mousemove",
    function(e) {
      last_mouse.x = mouse.x;
      last_mouse.y = mouse.y;

      mouse.x = e.pageX - this.offsetLeft;
      mouse.y = e.pageY - this.offsetTop;
    },
    false
  );

  canvas.addEventListener("mouseleave", function(e) {
    mouse.x = false;
    mouse.y = false;
  });

  canvas.addEventListener(
    "mousedown",
    function(e) {
      clicked = true;
      // Click pulse effect
      createPulse(mouse.x, mouse.y);
    },
    false
  );

  canvas.addEventListener(
    "mouseup",
    function(e) {
      clicked = false;
    },
    false
  );
  
  // Touch screen support
  canvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
    mouse.x = e.touches[0].pageX - canvas.offsetLeft;
    mouse.y = e.touches[0].pageY - canvas.offsetTop;
    clicked = true;
    createPulse(mouse.x, mouse.y);
  }, false);
  
  canvas.addEventListener("touchmove", function(e) {
    e.preventDefault();
    mouse.x = e.touches[0].pageX - canvas.offsetLeft;
    mouse.y = e.touches[0].pageY - canvas.offsetTop;
  }, false);
  
  canvas.addEventListener("touchend", function(e) {
    clicked = false;
  }, false);

  function loop() {
    window.requestAnimFrame(loop);
    c.clearRect(0, 0, w, h);
    draw();
  }

  window.addEventListener("resize", function() {
    (w = canvas.width = window.innerWidth),
      (h = canvas.height = window.innerHeight);
    loop();
  });

  loop();
  setInterval(loop, 1000 / 60);
};