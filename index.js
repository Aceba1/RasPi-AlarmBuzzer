const express = require('express');
const cors = require('cors');
require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const app = express();
const port = Number.parseInt(process.env.PORT) || 5000;
require('./util/scheduler');

app.use(express.json());
app.use(cors());

const configRoute = require('./routes/configRoute');

app.use('/', configRoute);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

require('./util/buzzer').begin();
