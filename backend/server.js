require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const chatRoutes = require('./routes/chat');


const app = express();
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5000' })); // adjust origin to frontend
app.use(express.json({ limit: '100kb' }));


app.use('/api/chat', chatRoutes);


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on ${port}`));