const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const fs = require('fs');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['Android', 'Chrome', '10'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      '';

    if (text.toLowerCase() === '.menu') {
      await sock.sendMessage(from, {
        text: `🌟 *DenzzBot Menu* 🌟\n\n1. BELI NOKOS (Rp5.000)\n2. DEPOSIT\n3. CEK SALDO\n4. HUBUNGI ADMIN`,
      });
    }

    if (text.toLowerCase().startsWith('beli')) {
      await sock.sendMessage(from, {
        text: `🛒 *Nokos WhatsApp Indonesia*\n💰 Harga: Rp5.000\n\nSilakan transfer ke DANA: 08xxxxxxxxxx\nLalu kirim bukti transfer ke admin.`,
      });
    }

    if (text.toLowerCase().startsWith('deposit')) {
      await sock.sendMessage(from, {
        text: `📥 *Deposit sedang diproses...*\nAdmin akan memverifikasi secara manual.`,
      });
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot connected!');
    }
  });
}

startBot();
