const http = require('http');
const express = require('express');
const app = express();
const updateLocations = require('./lib/update_locations');

let numPings = 0;

app.get('/', function (request, response) {
  numPings++;
  console.log(Date.now() + ' Ping Received');

  if (numPings % 3 === 0) {
    updateLocations();
  }

  response.sendStatus(200);
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  updateLocations();
});

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
