const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const socRoutes = require('./routes/socRoutes');

const mongoose = require('mongoose');
const cron = require('node-cron');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/soc', socRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SOC Engine is running' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fraud_detection')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Cron job to delete records older than 7 days
cron.schedule('0 0 * * *', async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const result = await Transaction.deleteMany({ timestamp: { $lt: sevenDaysAgo } });
    console.log(`Cron Job: Deleted ${result.deletedCount} transactions older than 7 days.`);
  } catch (err) {
    console.error('Cron Job Error:', err);
  }
});

app.listen(PORT, () => {
  console.log(`Financial Threat Detection SOC Engine running on port ${PORT}`);
});
