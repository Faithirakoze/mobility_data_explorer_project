const express = require('express');
const cors = require('cors');
const tripRoutes = require('./routes/tripRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/api/trips', tripRoutes);
app.use('/api/vendors', vendorRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Mobility Data Explorer API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

