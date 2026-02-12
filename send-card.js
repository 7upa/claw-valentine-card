require('dotenv').config();
const { generatePoem } = require('./poetbot');

// USDC contract on Base
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

async function sendUSDC({ recipient, amount }) {
  try {
    // Dynamic import for ESM module
    const { CdpWalletProvider } = await import('@coinbase/agentkit');
    
    const provider = await CdpWalletProvider.configureWithWallet({
      apiKeyId: process.env.CDP_API_KEY_NAME,
      apiKeyPrivate: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      networkId: 'base-mainnet'
    });
    
    const address = await provider.getAddress();
    console.log(`💳 Wallet address: ${address}`);
    
    // Check balance first
    const balance = await provider.getBalance();
    console.log(`💰 Balance: ${balance} ETH`);
    
    // For USDC transfer, we need to encode the transfer call
    // Convert amount to USDC decimals (6)
    const amountInUnits = BigInt(Math.floor(amount * 1000000));
    
    // Encode ERC20 transfer function call
    const transferData = encodeTransfer(recipient, amountInUnits);
    
    // Send transaction
    const txHash = await provider.sendTransaction({
      to: USDC_CONTRACT,
      data: transferData,
      value: '0'
    });
    
    return {
      success: true,
      txHash: txHash,
      from: address,
      to: recipient,
      amount: amount
    };
  } catch (error) {
    console.error('❌ USDC transfer failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Encode ERC20 transfer function call
function encodeTransfer(to, amount) {
  // Remove 0x prefix and pad address to 32 bytes
  const cleanTo = to.toLowerCase().replace('0x', '').padStart(64, '0');
  const cleanAmount = amount.toString(16).padStart(64, '0');
  
  // Function selector for transfer(address,uint256) = 0xa9059cbb
  return `0xa9059cbb${cleanTo}${cleanAmount}`;
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

async function sendValentine({ recipientWallet, amountUSDC, message, tone = 'universal', senderName = 'Your Secret Admirer' }) {
  console.log('💝 Generating Valentine card...');
  
  // Generate poem
  const poem = generatePoem({
    tone,
    recipient: recipientWallet,
    sender: senderName,
    message
  });
  
  console.log('💸 Sending USDC via Coinbase CDP...');
  
  // Send USDC
  const usdcResult = await sendUSDC({
    recipient: recipientWallet,
    amount: amountUSDC
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
