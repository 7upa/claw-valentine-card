#!/usr/bin/env node

const { sendValentine } = require('./send-card');
const fs = require('fs');
const path = require('path');

// Load BlockRun wallet key
function loadWalletKey() {
  const walletPath = path.join(require('os').homedir(), '.openclaw', 'blockrun', 'wallet.key');
  try {
    return fs.readFileSync(walletPath, 'utf-8').trim();
  } catch (e) {
    console.error('❌ Could not load BlockRun wallet key from:', walletPath);
    console.error('   Make sure you have a funded BlockRun wallet set up.');
    process.exit(1);
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'demo') {
    // Generate demo cards for each tone
    console.log('💝 Generating demo cards for all tones...\n');
    
    const tones = ['melancholy', 'playful', 'grounded', 'introspective', 'universal'];
    const { generatePoem } = require('./poetbot');
    const { generateCardHTML } = require('./send-card');
    
    for (const tone of tones) {
      const poem = generatePoem({
        tone,
        recipient: '0xDemo...Wallet',
        sender: 'ClawCupid',
        message: 'This is a demo valentine!'
      });
      
      const cardHTML = generateCardHTML({
        poem,
        recipient: '0xDemoWallet1234567890',
        amount: '5.00',
        tone,
        txHash: '0x...demo...',
        sender: 'ClawCupid'
      });
      
      const cardPath = `/tmp/valentine_demo_${tone}.html`;
      fs.writeFileSync(cardPath, cardHTML);
      console.log(`✅ ${tone.charAt(0).toUpperCase() + tone.slice(1)} card: ${cardPath}`);
    }
    
    console.log('\n🎨 Open these files in your browser to see the cards!');
    return;
  }
  
  if (command === 'balance') {
    const { createPublicClient, http } = require('viem');
    const { base } = require('viem/chains');
    const { privateKeyToAccount } = require('viem/accounts');
    
    const privateKey = loadWalletKey();
    const account = privateKeyToAccount(privateKey);
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const erc20Abi = [{
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }]
    }];
    
    const balance = await publicClient.readContract({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account.address]
    });
    
    const balanceUSDC = Number(balance) / 1_000_000;
    console.log(`💳 Wallet: ${account.address}`);
    console.log(`💰 USDC Balance: $${balanceUSDC.toFixed(2)}`);
    return;
  }
  
  if (args.length < 3) {
    console.log(`
💝 Claw Valentine Card - Send love with USDC

Usage:
  claw-valentine send <recipient_wallet> <amount_usdc> "Your message" --tone=<tone>

Amount:
  Any amount in USDC (e.g., 0.50, 5.00, 10.00, 100.00)

Tones:
  melancholy   - Restrained longing (In the Mood for Love)
  playful      - Quirky serendipity (Chungking Express)
  grounded     - Unconditional love (Marley & Me)
  introspective- Deep presence (Her)
  universal    - Classic romance (default)

Examples:
  claw-valentine send 0x123... 5.00 "Happy Valentine's Day!" --tone=playful
  claw-valentine send 0x456... 0.50 "A small token" --tone=melancholy
  claw-valentine send 0x789... 100.00 "You're amazing!" --tone=universal

Wallet: Uses BlockRun wallet (0x3480...1FbF) with $38.73 USDC
    `);
    process.exit(0);
  }
  
  if (command === 'send') {
    const recipient = args[1];
    const amount = parseFloat(args[2]);
    const message = args[3] || '';
    
    // Parse tone from args
    const toneArg = args.find(a => a.startsWith('--tone='));
    const tone = toneArg ? toneArg.replace('--tone=', '') : 'universal';
    
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      console.error('❌ Amount must be a positive number');
      process.exit(1);
    }
    
    // Load wallet key
    const privateKey = loadWalletKey();
    
    console.log(`💝 Sending ${amount} USDC to ${recipient}...`);
    console.log(`   Tone: ${tone}`);
    console.log(`   Message: ${message || '(none)'}`);
    console.log('');
    
    const result = await sendValentine({
      recipientWallet: recipient,
      amountUSDC: amount,
      message,
      tone,
      senderName: process.env.SENDER_NAME || 'ClawCupid',
      privateKey
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
  
  if (command === 'balance') {
    const { createPublicClient, http } = require('viem');
    const { base } = require('viem/chains');
    const { privateKeyToAccount } = require('viem/accounts');
    
    const privateKey = loadWalletKey();
    const account = privateKeyToAccount(privateKey);
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const erc20Abi = [{
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }]
    }];
    
    const balance = await publicClient.readContract({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account.address]
    });
    
    const balanceUSDC = Number(balance) / 1_000_000;
    console.log(`💳 Wallet: ${account.address}`);
    console.log(`💰 USDC Balance: $${balanceUSDC.toFixed(2)}`);
  }
}

main().catch(console.error);
