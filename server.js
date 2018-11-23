const http = require('http');
const express = require('express');
const app = express();
const updateLocations = require('./lib/update_locations');
const updateslothInfo = require('./lib/update_sloth_info');

// TODO: get all sloths, assign to object lastUpdated.  in update locations and update sloth info, only update those sloths that have changed

let numPings = 0;

app.get('/', function (request, response) {
  numPings++;
  console.log(Date.now() + ' Ping Received');

  if (numPings % 3 === 0) updateLocations();
  if (numPings === 1) updateslothInfo();
  if (numPings % 11 === 0 && numPings % 3 !== 0) updateslothInfo();

  response.sendStatus(200);
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  updateLocations();
});

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
