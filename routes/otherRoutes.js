const express = require('express');
const authController = require('../controllers/authController');
const notificationController = require('../controllers/notificationController');
const paymentController = require('../controllers/paymentController');
const decryptController = require('../controllers/decryptController');

const router = express.Router();

router.use(authController.protect);

router.post('/wallet/job/:id', paymentController.makeTransaction);

router.put('/read',
    decryptController.getDecryptedData,
    notificationController.readNotification
);

module.exports = router;