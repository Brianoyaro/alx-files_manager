const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

const routes = require('./routes/index.js');
app.use('/', routes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server running on port ${port}`));
