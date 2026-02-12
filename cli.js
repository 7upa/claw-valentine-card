#!/usr/bin/env node

const { sendValentine } = require('./send-card');
const fs = require('fs');

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(`
💝 Claw Valentine Card - Send love with USDC

Usage:
  claw-valentine send <recipient_wallet> <amount_usdc> "Your message" --tone=<tone>

Tones:
  melancholy   - Restrained longing (In the Mood for Love)
  playful      - Quirky serendipity (Chungking Express)
  grounded     - Unconditional love (Marley & Me)
  introspective- Deep presence (Her)
  universal    - Classic romance (default)

Examples:
  claw-valentine send 0x123... 5.00 "Happy Valentine's Day!" --tone=playful
  claw-valentine send 0x456... 1.50 "Thinking of you" --tone=melancholy
    `);
    process.exit(0);
  }
  
  const command = args[0];
  
  if (command === 'send') {
    const recipient = args[1];
    const amount = parseFloat(args[2]);
    const message = args[3] || '';
    
    // Parse tone from args
    const toneArg = args.find(a => a.startsWith('--tone='));
    const tone = toneArg ? toneArg.replace('--tone=', '') : 'universal';
    
    console.log(`💝 Sending ${amount} USDC to ${recipient}...`);
    console.log(`   Tone: ${tone}`);
    console.log(`   Message: ${message || '(none)'}`);
    console.log('');
    
    const result = await sendValentine({
      recipientWallet: recipient,
      amountUSDC: amount,
      message,
      tone,
      senderName: process.env.SENDER_NAME || 'Your Secret Admirer'
    });
    
    if (result.success) {
      console.log('✅ Valentine sent successfully!');
      console.log('📜 Poem:', result.poem);
      console.log('🔗 Transaction:', result.txHash);
      
      // Save HTML card
      const cardPath = `/tmp/valentine_card_${Date.now()}.html`;
      fs.writeFileSync(cardPath, result.cardHTML);
      console.log('💾 Card saved to:', cardPath);
    } else {
      console.error('❌ Failed to send:', result.error);
      process.exit(1);
    }
  }
}

main().catch(console.error);
