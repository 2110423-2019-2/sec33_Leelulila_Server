const CryptoJS = require('crypto-js');

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, '123456');
  const payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return payload;
};

exports.getDecryptedData = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    req.body = decryptData(req.body.data);
    delete req.body.data
  }
  next();
};

exports.encryptData = data => {
  if (process.env.NODE_ENV === 'development') {
    data = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
  }
  return data;
};