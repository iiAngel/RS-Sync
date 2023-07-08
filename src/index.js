const express = require('express');
const app = express();
// Routes
const studioRoutes = require('./api/v1/src/studioRoutes')
// App config
require('dotenv').config();
const PORT = process.env.HOST_PORT;

// Config routes
app.use(express.json())
app.use('/api/v1', studioRoutes)
app.use(express.static(__dirname + "\\public\\"))

app.listen(PORT, () => {
    console.log(`Listening port ${PORT}`);
})
