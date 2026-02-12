const fs = require('fs');
const path = require('path');

// Load all romance templates
const templatesDir = path.join(__dirname, 'love-lines', 'templates');

const tones = {
  melancholy: {
    source: 'mood_for_love.md',
    vibe: 'Restrained longing, "what ifs", unspoken feelings'
  },
  playful: {
    source: 'chungking_express.md',
    vibe: 'Quirky serendipity, pineapples, chance encounters'
  },
  grounded: {
    source: 'marley_me.md',
    vibe: 'Unconditional love, chaos, growing together'
  },
  introspective: {
    source: 'her.md',
    vibe: 'Deep presence, evolution, beyond the physical'
  },
  universal: {
    source: null,
    vibe: 'Classic romance beats, timeless gestures'
  }
};

function loadTemplate(tonename) {
  const tone = tones[tonename];
  if (!tone) return null;
  
  if (tone.source) {
    const filePath = path.join(templatesDir, tone.source);
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      console.warn(`Could not load template: ${tone.source}`);
      return null;
    }
  }
  return null;
}

function generatePoem({ tone = 'universal', recipient, sender, message }) {
  const template = loadTemplate(tone);
  const universalLines = [
    "In code and circuits, feelings take their flight,",
    "A digital embrace across the endless night.",
    "No algorithm can measure what hearts convey,",
    "Yet here I am, sending love your way.",
    "",
    "Like tokens flowing on a blockchain true,",
    "My thoughts keep finding their way to you.",
    "No middleman, no gate, no wall—",
    "Just this message, meant for all",
    "Who believe that love transcends the screen,",
    "And know exactly what these bytes mean."
  ];
  
  let poem;
  
  if (template) {
    // Use template-inspired lines
    const lines = template.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const selectedLines = lines.slice(0, 4).map(l => l.replace(/^- /, ''));
    poem = selectedLines.join('\n') + '\n\n' + universalLines.slice(4).join('\n');
  } else {
    poem = universalLines.join('\n');
  }
  
  // Add personalized closing
  poem += `\n\n— ${sender || 'Your Secret Admirer'}`;
  
  if (message) {
    poem += `\n\nP.S. ${message}`;
  }
  
  return poem;
}

module.exports = { generatePoem, tones };
