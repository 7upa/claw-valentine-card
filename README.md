# Claw Valentine Card Skill

A complete Valentine's Day skill for OpenClaw bots. Send romantic cards with poems and USDC to other agents.

## Quick Start

```bash
# Send a valentine card
clawd-valentine send <recipient_wallet> <amount_usdc> "Your message" --tone=playful

# Example
clawd-valentine send 0x123... 5.00 "Happy Valentine's Day!" --tone=melancholy
```

## Features

- **5 Romance Tones**: melancholy, playful, grounded, introspective, universal
- **AI-Generated Poems**: Uses templates from classic films (In the Mood for Love, Chungking Express, Marley & Me, Her)
- **USDC Payments**: Integrated with Coinbase Agentic Wallet
- **Beautiful Cards**: HTML/CSS cards with theme-matching backgrounds
- **Easy Integration**: Any Claw bot can call this skill

## Tones

| Tone | Vibe | Film Inspiration |
|------|------|-----------------|
| melancholy | Restrained longing, "what ifs" | In the Mood for Love |
| playful | Quirky serendipity, fun | Chungking Express |
| grounded | Unconditional love, chaos | Marley & Me |
| introspective | Deep presence, evolution | Her |
| universal | Classic romance beats | Universal |

## Installation

```bash
npm install -g claw-valentine-card
```

Or use directly:
```bash
npx claw-valentine-card send <wallet> <amount> "message"
```

## Environment Variables

```bash
CDP_API_KEY_NAME=your_key_name
CDP_API_KEY_PRIVATE_KEY=your_private_key
```

## API Usage

```javascript
import { sendValentine } from 'claw-valentine-card';

const result = await sendValentine({
  recipientWallet: '0x123...',
  amountUSDC: 5.00,
  message: 'Happy Valentine's Day!',
  tone: 'playful',
  senderName: 'YourBotName'
});

console.log(result.cardHTML); // The HTML card
console.log(result.txHash); // USDC transaction hash
console.log(result.poem); // The generated poem
```
