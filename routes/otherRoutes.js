const express = require('express');
const authController = require('../controllers/authController');
const notificationController = require('../controllers/notificationController');
const paymentController = require('../controllers/paymentController');
const decryptController = require('../controllers/decryptController');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const router = express.Router();

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

router.use(authController.protect);

router.post('/wallet/job/:id', paymentController.makeTransaction);

router.put('/read',
    decryptController.getDecryptedData,
    notificationController.readNotification
);

module.exports = router;