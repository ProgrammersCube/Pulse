const playSound = (frequency, duration, type = 'sine') => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};
export const SOUNDS = {
  countdown: () => playSound(800, 0.1),
  matchFound: () => playSound(1200, 0.2),
  gameStart: () => {
    playSound(400, 0.1);
    setTimeout(() => playSound(600, 0.1), 100);
    setTimeout(() => playSound(800, 0.2), 200);
  },
  tick: () => playSound(1000, 0.05),
  warning: () => playSound(600, 0.15, 'square'),
  win: () => {
    playSound(800, 0.1);
    setTimeout(() => playSound(1000, 0.1), 100);
    setTimeout(() => playSound(1200, 0.3), 200);
  },
  loss: () => playSound(200, 0.5, 'sawtooth')
};