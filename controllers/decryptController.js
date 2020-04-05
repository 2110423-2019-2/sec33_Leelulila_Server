const CryptoJS = require('crypto-js');

const decryptData = (encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, '123456');
    const payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return payload;
};

exports.getDecryptedData = (req, res, next) => {
    rawData = req.body.data
    if (process.env.NODE_ENV === 'production') {
        req.body = decryptData(rawData);
    }
    next();
}