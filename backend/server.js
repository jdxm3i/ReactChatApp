require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const Message = mongoose.model('Message', {
  text: String,
  audioUrl: String,
  timestamp: { type: Date, default: Date.now },
});

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/api/messages', (req, res) => {
  const encryptedText = CryptoJS.AES.encrypt(req.body.text, process.env.ENCRYPTION_KEY).toString();
  const message = new Message({ text: encryptedText });
  message.save()
    .then(() => {
      res.status(201).send('Message saved');
    })
    .catch((err) => {
      console.error('Error saving message:', err);
      res.status(500).send('Error saving message');
    });
});

app.post('/api/messages/audio', upload.single('audio'), (req, res) => {
  const audioUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const message = new Message({ audioUrl });
  message.save()
    .then(() => {
      res.status(201).send('Audio message saved');
    })
    .catch((err) => {
      console.error('Error saving audio message:', err);
      res.status(500).send('Error saving audio message');
    });
});

app.get('/api/messages', (req, res) => {
  Message.find()
    .then((messages) => {
      const decryptedMessages = messages.map((msg) => {
        const bytes = CryptoJS.AES.decrypt(msg.text, process.env.ENCRYPTION_KEY);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        return { text: decryptedText, audioUrl: msg.audioUrl, timestamp: msg.timestamp };
      });
      res.json(decryptedMessages);
    })
    .catch((err) => {
      console.error('Error fetching messages:', err);
      res.status(500).send('Error fetching messages');
    });
});

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
