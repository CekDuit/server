const { google } = require('googleapis');
const axios = require('axios');

const userTokens = {}; // Token pengguna (gunakan database dalam produksi)

const startGmailWatch = async (email, token) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const watchRequest = {
    userId: 'me',
    resource: {
      labelIds: ['INBOX'],
      topicName: `projects/cekduit/topics/CekDuit`,
    },
  };

  try {
    const response = await gmail.users.watch(watchRequest);
    console.log(`Started watch for user: ${email}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error starting Gmail watch for user ${email}:`, error);
    throw error;
  }
};

const setupWatch = async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).send('Email and token are required.');
  }

  try {
    // Simpan token pengguna
    userTokens[email] = token;

    // Mulai Gmail Watch
    const watchResponse = await startGmailWatch(email, token);
    res.status(200).send({ message: 'Watch started successfully', watchResponse });
  } catch (error) {
    res.status(500).send({ message: 'Failed to start watch', error: error.message });
  }
};

// Controller: Handle Gmail Notifications
const handleNotifications = async (req, res) => {
  const pubsubMessage = req.body.message;
  if (!pubsubMessage || !pubsubMessage.data) {
    return res.status(400).send('Invalid Pub/Sub message.');
  }

  // Decode pesan
  const data = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
  const { emailAddress, historyId } = data;

  // Ambil token pengguna
  const token = userTokens[emailAddress];
  if (!token) {
    return res.status(404).send('User token not found.');
  }

  // Ambil perubahan email dari Gmail
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const historyResponse = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: historyId,
    });

    const messages = historyResponse.data.history || [];
    for (const historyItem of messages) {
      if (historyItem.messages) {
        for (const message of historyItem.messages) {
          const messageId = message.id;

          const email = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'raw',
          });

          const emlData = Buffer.from(email.data.raw, 'base64').toString();

          await axios.post(process.env.MACHINE_LEARNING_ENDPOINT, { eml: emlData });
        }
      }
    }

    res.status(200).send('Notification processed successfully.');
  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(500).send('Error processing notification.');
  }
};

module.exports = {
  setupWatch,
  handleNotifications,
};
