import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  // Create a canvas element for the confetti
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  document.body.appendChild(canvas);

  // Create the confetti instance
  const myConfetti = confetti.create(canvas, {
    resize: true,
    useWorker: true,
  });

  // Fire the confetti with custom options
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  // Launch multiple bursts of confetti
  (function frame() {
    myConfetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ['#5D3FD3', '#9D4EDD', '#C77DFF', '#E0AAFF'],
    });
    
    myConfetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ['#5D3FD3', '#9D4EDD', '#C77DFF', '#E0AAFF'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    } else {
      // Remove the canvas when animation is complete
      setTimeout(() => {
        document.body.removeChild(canvas);
      }, 1000);
    }
  })();
};

// More dramatic confetti for successful image generation
export const celebrateImageGeneration = () => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  document.body.appendChild(canvas);

  const myConfetti = confetti.create(canvas, {
    resize: true,
    useWorker: true,
  });

  // First burst - center
  myConfetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#5D3FD3', '#9D4EDD', '#C77DFF', '#E0AAFF'],
  });

  // Fire multiple bursts in sequence
  setTimeout(() => {
    // Left side burst
    myConfetti({
      particleCount: 50,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.6 },
      colors: ['#5D3FD3', '#9D4EDD', '#C77DFF', '#E0AAFF'],
    });
  }, 250);

  setTimeout(() => {
    // Right side burst
    myConfetti({
      particleCount: 50,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.6 },
      colors: ['#5D3FD3', '#9D4EDD', '#C77DFF', '#E0AAFF'],
    });
  }, 400);

  // Remove the canvas after animation completes
  setTimeout(() => {
    document.body.removeChild(canvas);
  }, 3000);
};