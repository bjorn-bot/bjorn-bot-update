// server.js
// where your node app starts

// init project
const http = require('http');
const express = require('express');
const app = express();
const updateLocations = require('./lib/update_locations');

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
let numPings = 0;

app.get('/', function (request, response) {
  numPings++;
  console.log(Date.now() + ' Ping Received');

  if (numPings === 3) {
    numPings = 0;
    updateLocations();
  }

  response.sendStatus(200);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  updateLocations();
});

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
