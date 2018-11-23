const mongoose = require('mongoose');
const superagent = require('superagent');
const getAuthToken = require('./get_auth_token');
const Sloth = require(__dirname + '/../models/sloth');

module.exports = async function() {
  mongoose.connect(process.env.MONGODB_URI || process.env.BJORN_BOT_MLAB_URI);

  let playerApiUrl = process.env.BJORN_BOT_PLAYER_URL;

  let allSlothInfos = [];
  let slothInfoUpdatePromises = [];

  let authKey = await getAuthToken();

  console.log('authed - starting');

  Sloth.find(null, (err, sloths) => {
    sloths.forEach((owner) => {
      slothInfoUpdatePromises.push(getInfo(owner.owner_id, authKey));
    });

    Promise.all(slothInfoUpdatePromises).then((sloths) => {
      console.log('all sloth info', allSlothInfos.length);
      allSlothInfos = [];
      slothInfoUpdatePromises = [];
      mongoose.disconnect();
    });
  });

  function getInfo(owner_id, authKey) {
    return new Promise((resolve, reject) => {
      var reqUrl = `${playerApiUrl}${owner_id}/info`;

      superagent.get(reqUrl)
        .set('authorization', authKey)
        .end((err, res) => {
          if (err) {
            console.log(reqUrl);
            return resolve(err);
          }

          Sloth.findOne({ owner_id: owner_id }, (err, sloth) => {
            if (!sloth) return resolve();

            sloth.power = res.body.power;

            Sloth.update({ owner_id: owner_id }, sloth, (err, data) => {
              if (err) console.log(err);
              if (!data.ok) console.log('error updating sloth');

              allSlothInfos.push(sloth.name);
              return resolve(sloth.name);
            });
          });
        });
    });
  }
};