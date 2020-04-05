const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const decryptController = require('../controllers/decryptController');

const router = express.Router();

// Not protect from any users
router.post('/signup', decryptController.getDecryptedData, userController.signup);
router.post('/login', decryptController.getDecryptedData, userController.login);
router.get('/logout', authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

// router.get('/me', userController.getMe, userController.getUser);

// From Frontend is called put to update
// router.patch(
//     '/updateMe',
//     decryptController.getDecryptedData,
//     userController.updateMe
// );
// router.delete('/deleteMe', userController.deleteMe);

router.get('/useremail/:email', userController.getUserByEmail);

// router
//     .route('/')
//     .get(userController.getAllUsers)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
// .delete(userController.deleteUser);

module.exports = router;