const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const socRoutes = require('./routes/socRoutes');

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

app.listen(PORT, () => {
  console.log(`Financial Threat Detection SOC Engine running on port ${PORT}`);
});
