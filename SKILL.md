# Valentine Card Skill

Send Valentine's Day cards with AI-generated poems and USDC payments using Coinbase CDP Agentic Wallet.

## Overview

This skill allows any OpenClaw bot to send romantic Valentine cards with:
- 📝 AI-generated poems in 5 different tones
- 💝 Beautiful HTML cards with theme-matching designs
- 💸 USDC transfers via Coinbase CDP Agentic Wallet on Base

## Installation

```bash
cd skills/valentine-card
npm install
```

## Configuration

Create a `.env` file:

```bash
CDP_API_KEY_NAME=your_key_name_here
CDP_API_KEY_PRIVATE_KEY=your_private_key_here
SENDER_NAME=YourBotName  # Optional
```

## Usage

### Programmatic

```javascript
const { sendValentine } = require('./send-card');

const result = await sendValentine({
  recipientWallet: '0x123...',
  amountUSDC: 5.00,
  message: 'Happy Valentine\'s Day!',
  tone: 'playful',
  senderName: 'ClawBoss'
});

console.log(result.cardHTML);  // The HTML card
console.log(result.txHash);    // USDC transaction hash
console.log(result.poem);      // The generated poem
```

### CLI

```bash
# Send a valentine card
node cli.js send 0x123... 5.00 "Happy Valentine's Day!" --tone=playful

# Or install globally
npm link
claw-valentine send 0x123... 5.00 "Happy Valentine's Day!" --tone=melancholy
```

## Tones

| Tone | Vibe | Film Inspiration |
|------|------|-----------------|
| `melancholy` | Restrained longing, "what ifs" | In the Mood for Love |
| `playful` | Quirky serendipity, fun | Chungking Express |
| `grounded` | Unconditional love, chaos | Marley & Me |
| `introspective` | Deep presence, evolution | Her |
| `universal` | Classic romance beats | Universal |

## File Structure

```
valentine-card/
├── SKILL.md              # This file
├── README.md             # User-facing docs
├── package.json          # Dependencies (@coinbase/agentkit)
├── cli.js                # CLI entry point
├── send-card.js          # Main orchestrator with CDP integration
├── poetbot.js            # Poem generator
├── .env.example          # Environment template
└── love-lines/
    └── templates/        # Romance templates from films
        ├── mood_for_love.md
        ├── chungking_express.md
        └── marley_me.md
```

## Dependencies

- `@coinbase/agentkit` - CDP wallet integration
- `dotenv` - Environment variables
- `viem` - Ethereum utilities

## Network

- **Base Mainnet** (chain ID: 8453)
- **USDC Contract**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Security

⚠️ **NEVER commit your `.env` file or CDP credentials!**

The `.env` file is already in `.gitignore`. Always keep your CDP API keys secure.
