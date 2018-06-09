const http = require('http');
const express = require('express');
const app = express();
const updateLocations = require('./lib/update_locations');
const updateKeepInfo = require('./lib/update_keep_info');

// TODO: get all keeps, assign to object lastUpdated.  in update locations and update keep info, only update those keeps that have changed

let numPings = 0;

app.get('/', function (request, response) {
  numPings++;
  console.log(Date.now() + ' Ping Received');

  if (numPings % 3 === 0) updateLocations();
  if (numPings === 1) updateKeepInfo();
  if (numPings % 11 === 0 && numPings % 3 !== 0) updateKeepInfo();

  response.sendStatus(200);
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  updateLocations();
});

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
