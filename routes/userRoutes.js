const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const decryptController = require('../controllers/decryptController');

const router = express.Router();

// Not protect from any users
router.post('/signup', decryptController.getDecryptedData, authController.signup);
router.post('/login', decryptController.getDecryptedData, authController.login);
router.get('/logout', authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);

// From Frontend is called put to update
router.patch(
    '/updateMe',
    decryptController.getDecryptedData,
    userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.get('/useremail/:email', userController.getUserByEmail);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;

// Original mongo
// app.post('/newuser', (req, res) => {
//     let payload = req.body;
//     if (process.env.NODE_ENV === 'production') {
//         payload = decryptData(payload.data);
//     }
//     users.createUser(client, payload, res);
// });

// app.post('/userlogin', (req, res) => {
//     let payload = req.body;
//     if (process.env.NODE_ENV === 'production') {
//         payload = decryptData(payload.data);
//     }
//     users.userLogin(client, payload, res);
// });

// app.get('/userlogout', (req, res) => {
//     authController.logout(req, res);
// })

// app.get('/user/:id', authController.protect, (req, res) => {
//     //get all list of db
//     console.log('fromgetuserid', req.cookies);
//     const id = parseInt(req.params.id);
//     users.findUserByID(client, id, res);
// });
// app.get('/useremail/:email', authController.protect, (req, res) => {
//     //get all list of db
//     console.log('fromgetuseremail', req.cookies);
//     res.header('Access-Control-Allow-Origin', '*');
//     var email = req.params.email;
//     users.findUserByEmail(client, email, res);
// });
// app.put('/user/:id', authController.protect, (req, res) => {
//     let payload = req.body;
//     if (process.env.NODE_ENV === 'production') {
//         payload = decryptData(payload.data);
//     }
//     const id = parseInt(req.params.id);
//     users.updateUserByID(client, id, payload, res);
// });