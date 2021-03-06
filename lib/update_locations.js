const mongoose = require('mongoose');
const superagent = require('superagent');
const getAuthToken = require('./get_auth_token');
const Sloth = require(__dirname + '/../models/sloth');

module.exports = async function() {
  mongoose.connect(process.env.MONGODB_URI || process.env.BJORN_BOT_MLAB_URI);

  let kingdom = process.env.BJORN_BOT_KINGDOM;
  let mapApiUrl = process.env.BJORN_BOT_MAP_URL;

  let allSloths = [];
  let mapWalkPromises = [];
  let slothUpdatePromises = [];

  let authKey = await getAuthToken();
  let isUpdated = {};

  console.log('authed - starting');

  for (var xVal = 0; xVal < 1337; xVal += 60) {
    for (var yVal = 0; yVal < 2164; yVal += 60) {
      mapWalkPromises.push(mapWalk(xVal, yVal, authKey, isUpdated));
    }
  }

  Promise.all(mapWalkPromises)
    .then(() => {
      Promise.all(slothUpdatePromises)
        .then(() => {
          console.log('all sloths', allSloths.length);
          allSloths = [];
          mapWalkPromises = [];
          slothUpdatePromises = [];
          mongoose.disconnect();
        })
        .catch((err) => {
          if (err) console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });


  function mapWalk(xVal, yVal, authKey, isUpdated) {
    return new Promise((resolve, reject) => {
      var reqUrl = `${mapApiUrl}${kingdom}/node?x=${xVal}&y=${yVal}&w=60&h=80&metadata=1`;

      superagent.get(reqUrl)
        .set('authorization', authKey)
        .end((err, res) => {
          if (err) {
            console.log(reqUrl);
            return resolve(err);
          }

          let owners = res.body.metadata.owners;

          res.body.nodes.forEach((node) => {
            if (node.owner_id && !isUpdated[node.owner_id]) {
              let owner = owners[node.owner_id].namespaces;

              let ownerData = {
                owner_id: node.owner_id,
                name: owner.player.name,
                peaceshield: owner.player.peaceshield,
                sop: !!owner.sop.title_def,
                allegiance: owner.allegiance.tag,
                level: owner.home.level,
                location: {
                  x: node.location.x,
                  y: node.location.y
                }
              };

              slothUpdatePromises.push(new Promise((innerResolve, innerReject) => {
                Sloth.findOne({ owner_id: ownerData.owner_id }, (err, sloth) => {
                  if (!sloth) {
                    ownerData.allNames = [ownerData.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')];

                    if (ownerData.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '') !== ownerData.name) {
                      ownerData.allNames.push(ownerData.name);
                    }
                    ownerData.allAllegiances = [ownerData.allegiance];

                    let newSloth = new Sloth(ownerData);

                    newSloth.save((err) => {
                      if (err) console.log(err);

                      allSloths.push(ownerData);
                      return innerResolve();
                    });
                  } else {
                    if (sloth.allNames[sloth.allNames.length - 1] !== ownerData.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')) {
                      sloth.allNames.push(ownerData.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

                      if(ownerData.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '') !== ownerData.name) {
                        sloth.allNames.push(ownerData.name);
                      }
                    }

                    ownerData.allNames = sloth.allNames;

                    if (sloth.allAllegiances[sloth.allAllegiances.length - 1] !== ownerData.allegiance) {
                      sloth.allAllegiances.push(ownerData.allegiance);
                    }
                    ownerData.allAllegiances = sloth.allAllegiances;

                    Sloth.update({ owner_id: ownerData.owner_id }, ownerData, (err, data) => {
                      if (err) console.log(err);
                      if (!data.ok) console.log('error updating sloth');

                      allSloths.push(ownerData);
                      return innerResolve();
                    });
                  }
                });
              }));

              isUpdated[ownerData.owner_id] = true;
            }
          });

          return resolve();
        });
    });
  }
};
