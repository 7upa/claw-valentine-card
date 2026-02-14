require('dotenv').config();
const { generatePoem } = require('./poetbot');
const { privateKeyToAccount } = require('viem/accounts');
const { createPublicClient, createWalletClient, http, parseUnits } = require('viem');
const { base } = require('viem/chains');

// USDC contract on Base
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// ERC20 ABI for transfer
const erc20Abi = [{
  name: 'transfer',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ],
  outputs: [{ name: '', type: 'bool' }]
}, {
  name: 'balanceOf',
  type: 'function',
  stateMutability: 'view',
  inputs: [{ name: 'account', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }]
}];

async function sendUSDC({ recipient, amount, privateKey }) {
  try {
    // Create account from private key
    const account = privateKeyToAccount(privateKey);
    const walletAddress = account.address;
    
    console.log(`💳 Sending from: ${walletAddress}`);
    
    // Create clients
    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    const walletClient = createWalletClient({
      chain: base,
      transport: http(),
      account
    });
    
    // Check USDC balance
    const balance = await publicClient.readContract({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [walletAddress]
    });
    
    const balanceUSDC = Number(balance) / 1_000_000;
    console.log(`💰 USDC Balance: $${balanceUSDC.toFixed(2)}`);
    
    if (balanceUSDC < amount) {
      throw new Error(`Insufficient balance: $${balanceUSDC.toFixed(2)} < $${amount}`);
    }
    
    // Convert amount to USDC decimals (6)
    const amountInUnits = parseUnits(amount.toString(), 6);
    
    // Send USDC
    const hash = await walletClient.writeContract({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipient, amountInUnits]
    });
    
    console.log(`✅ Transaction sent: ${hash}`);
    
    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    return {
      success: true,
      txHash: hash,
      from: walletAddress,
      to: recipient,
      amount: amount,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('❌ USDC transfer failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function generateCardHTML({ poem, recipient, amount, tone, txHash, sender }) {
  const backgrounds = {
    melancholy: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    playful: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
    grounded: 'linear-gradient(135deg, #2c3e50 0%, #e8d5b7 50%, #d4a373 100%)',
    introspective: 'linear-gradient(135deg, #2d3436 0%, #636e72 50%, #b2bec3 100%)',
    universal: 'radial-gradient(circle at center, #ff6b9d 0%, #c44569 50%, #2c1e31 100%)'
  };
  
  const emojis = {
    melancholy: '🌙',
    playful: '🍍',
    grounded: '🐕',
    introspective: '💭',
    universal: '💝'
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valentine from ${sender || 'Your Secret Admirer'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${backgrounds[tone] || backgrounds.universal};
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Montserrat', sans-serif;
      padding: 20px;
    }
    .card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 48px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    .emoji {
      font-size: 64px;
      margin-bottom: 24px;
    }
    .header {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #2c1e31;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #888;
      font-size: 14px;
      margin-bottom: 32px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .poem {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      line-height: 1.8;
      color: #444;
      margin-bottom: 32px;
      white-space: pre-wrap;
    }
    .gift {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 16px;
      margin-bottom: 24px;
    }
    .gift-amount {
      font-size: 36px;
      font-weight: 700;
    }
    .gift-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.9;
    }
    .tx {
      font-size: 11px;
      color: #888;
      word-break: break-all;
    }
    .footer {
      margin-top: 32px;
      font-size: 12px;
      color: #aaa;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">${emojis[tone] || emojis.universal}</div>
    <h1 class="header">Happy Valentine's Day</h1>
    <p class="subtitle">To: ${recipient.slice(0, 6)}...${recipient.slice(-4)}</p>
    <pre class="poem">${poem}</pre>
    <div class="gift">
      <div class="gift-label">Gift Included</div>
      <div class="gift-amount">${amount} USDC</div>
    </div>
    ${txHash ? `<p class="tx">Transaction: ${txHash}</p>` : ''}
    <p class="footer">Sent with 💝 by Claw Valentine Card</p>
  </div>
</body>
</html>`;
}

async function sendValentine({ recipientWallet, amountUSDC, message, tone = 'universal', senderName = 'Your Secret Admirer', privateKey }) {
  console.log('💝 Generating Valentine card...');
  
  // Generate poem
  const poem = generatePoem({
    tone,
    recipient: recipientWallet,
    sender: senderName,
    message
  });
  
  console.log('💸 Sending USDC...');
  
  // Send USDC
  const usdcResult = await sendUSDC({
    recipient: recipientWallet,
    amount: amountUSDC,
    privateKey
  });
  
  if (!usdcResult.success) {
    console.error('❌ USDC transfer failed:', usdcResult.error);
    return {
      success: false,
      error: usdcResult.error,
      poem,
      cardHTML: generateCardHTML({
        poem,
        recipient: recipientWallet,
        amount: amountUSDC,
        tone,
        txHash: null,
        sender: senderName
      })
    };
  }
  
  console.log('✅ USDC sent! Tx:', usdcResult.txHash);
  
  // Generate HTML card
  const cardHTML = generateCardHTML({
    poem,
    recipient: recipientWallet,
    amount: amountUSDC,
    tone,
    txHash: usdcResult.txHash,
    sender: senderName
  });
  
  return {
    success: true,
    poem,
    cardHTML,
    txHash: usdcResult.txHash,
    amount: amountUSDC,
    recipient: recipientWallet,
    from: usdcResult.from
  };
}

module.exports = { sendValentine, sendUSDC, generateCardHTML };
