const express = require('express');
const cors = require('cors');
const resourceRoutes = require('./routes/resourceRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/resource', resourceRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
