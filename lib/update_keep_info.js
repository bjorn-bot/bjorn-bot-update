const mongoose = require('mongoose');
const superagent = require('superagent');
const getAuthToken = require('./get_auth_token');
const Keep = require(__dirname + '/../models/keep');

module.exports = async function() {
  mongoose.connect(process.env.MONGODB_URI || process.env.BJORN_BOT_MLAB_URI);

  let allKeepInfos = [];
  let keepInfoUpdatePromises = [];

  let authKey = await getAuthToken();

  console.log('authed - starting');

  Keep.find(null, (err, keeps) => {
    keeps.forEach((owner) => {
      keepInfoUpdatePromises.push(getInfo(owner.owner_id, authKey));
    });

    Promise.all(keepInfoUpdatePromises).then((keeps) => {
      console.log('all keep info', allKeepInfos.length);
      allKeepInfos = [];
      keepInfoUpdatePromises = [];
      mongoose.disconnect();
    });
  });

  function getInfo(owner_id, authKey) {
    return new Promise((resolve, reject) => {
      var reqUrl = `https://ronin-prod-game-player-info.rm.turbinemobile.com/v1/player/${owner_id}/info`;

      superagent.get(reqUrl)
        .set('authorization', authKey)
        .end((err, res) => {
          if (err) {
            console.log(reqUrl);
            return resolve(err);
          }

          Keep.findOne({ owner_id: owner_id }, (err, keep) => {
            if (!keep) return resolve();

            keep.power = res.body.power;

            Keep.update({ owner_id: owner_id }, keep, (err, data) => {
              if (err) console.log(err);
              if (!data.ok) console.log('error updating keep');

              allKeepInfos.push(keep.name);
              return resolve(keep.name);
            });
          });
        });
    });
  }
};