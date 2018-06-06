const superagent = require('superagent');
const forge = require('node-forge');
const decryptToken = require(__dirname + '/decrypt_token');

module.exports = function() {
  return new Promise((resolve, reject) => {
    let keypair = forge.pki.rsa.generateKeyPair({bits: 1024, e: 0x10001});

    // converts forge key object to pem formatted string, then converts
    // to a clean single-line string to be passed to the turbine api
    let publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey).split('\r\n');
    publicKeyPem.shift();
    publicKeyPem.pop();
    publicKeyPem.pop();
    let publicKey = publicKeyPem.join('');

    let privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

    superagent.post('https://ronin-prod-authentication.rm.turbinemobile.com/v1/authentication/publickey')
      .send({ public_key: publicKey, "game": null, "consent_map": { "privacy.wb.pp": { "version": 1.0 }, "terms.wb.tos": { "version": 1.0 } }})
      .end((err, res) => {
        return resolve(decryptToken(res.body.token, privateKeyPem));
      });
  });
};
