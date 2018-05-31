const crypto = require('crypto');

module.exports = function(token, privateKeyPem) {
  const numArray1 = Buffer.from(token, 'base64');
  const data = Buffer.allocUnsafe(128);
  const srcOffset1 = 0;
  const numArray2 = data;
  const dstOffset1 = 0;
  const count1 = 128;
  numArray1.copy(numArray2, dstOffset1, srcOffset1, count1);

  const numArray3 = Buffer.allocUnsafe(16);
  const srcOffset2 = 128;
  const numArray4 = numArray3;
  const dstOffset2 = 0;
  const count2 = 16;
  numArray1.copy(numArray4, dstOffset2, srcOffset2, srcOffset2 + count2);

  const buffer = Buffer.allocUnsafe(numArray1.length - 128 - 16);
  const srcOffset3 = 144;
  const numArray5 = buffer;
  const dstOffset3 = 0;
  const length = buffer.length;
  numArray1.copy(numArray5, dstOffset3, srcOffset3, srcOffset3 + length);

  const password = crypto.privateDecrypt({
    key: privateKeyPem,
    padding: crypto.constants.RSA_PKCS1_PADDING
  }, data);

  const decipher = crypto.createDecipheriv('aes-256-cbc', password, numArray3);
  decipher.setAutoPadding(false);
  let decrypted = decipher.update(numArray5.toString('hex'), 'hex');
  decrypted += decipher.final('utf8');

  return decrypted.replace(/\u0004/g, '');
};

