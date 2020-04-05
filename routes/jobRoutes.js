const express = require('express');
const jobController = require('../controllers/jobController');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');
const decryptController = require('../controllers/decryptController');

const router = express.Router();

router
  .route('/')
  .get(jobController.getAllJobs)
  // Frontend will called /newjob
  .post(
    decryptController.getDecryptedData,
    authController.protect,
    jobController.createJob
  );

// Protect all middleware below this
router.use(authController.protect);

router
  .route('/:id')
  .get(jobController.getJob)
  .patch(decryptController.getDecryptedData, jobController.updateJob)
  .delete(jobController.deleteJob);

router
  .route('/jobstatus/:id')
  // .get(jobController.getJobStatus)
  .patch(decryptController.getDecryptedData, jobController.updateJobStatus);

router
  .route('/:id/employee')
  .patch(
    decryptController.getDecryptedData,
    jobController.updateEmployeeByEmail
  );

router.put(
  '/:id/addAcceptedEmployee',
  decryptController.getDecryptedData,
  jobController.updateAcceptedEmployeeByEmail
);

router.delete(
  '/employee/:id',
  decryptController.getDecryptedData,
  jobController.deleteEmployee
);

// app.post('/wallet/job/:id', (req, res) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     var id = parseInt(req.params.id);
//     success = cash.makeTransaction(client, id, res);
//     jobs.updateJobStatusByID(client, id, 'Finish', res);
//   });

//   app.put('/job/addemployee/:id', (req, res) => {
//     // res.header('Access-Control-Allow-Origin', "*");
//     var id = parseInt(req.params.id);
//     console.log('receive success');
//     let payload = req.body;
//     if (process.env.NODE_ENV === 'production') {
//       payload = decryptData(payload.data);
//     }
//     console.log(payload.Email);
//     jobs.updateJobEmployeeByEmail(client, id, payload.Email, res);
//   });

//   app.put('/job/addacceptedemployee/:id', (req, res) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     var id = parseInt(req.params.id);
//     console.log(id);
//     let payload = req.body;
//     if (process.env.NODE_ENV === 'production') {
//       payload = decryptData(payload.data);
//     }
//     //console.log(payload.Email)
//     jobs.updateJobAcceptedEmployeeByEmail(client, id, payload.Email, res);
//   });

//   app.delete('/job/CurrentEmployee/:id', (req, res) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     var id = parseInt(req.params.id);
//     console.log(id);
//     let payload = req.body;
//     if (process.env.NODE_ENV === 'production') {
//       payload = decryptData(payload.data);
//     }
//     //console.log(payload.Email)
//     jobs.deleteCurrentEmployeeByID(client, id, payload.Email, res);
//   });

// app.post('/wallet/job/:id', (req, res) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     var id = parseInt(req.params.id);
//     success = cash.makeTransaction(client, id, res);
//     jobs.updateJobStatusByID(client, id, 'Finish', res);
//   });

// app.get('/job/:id', (req, res) => {
//     //get all list of db
//     res.header('Access-Control-Allow-Origin', '*');
//     var id = parseInt(req.params.id);

//     jobs.findJobByID(client, id, res);
//   });
//   app.post('/newjob', (req, res) => {
//     let payload = req.body;
//     if (process.env.NODE_ENV === 'production') {
//       payload = decryptData(payload.data);
//     }
//     jobs.createJob(client, payload, res);
//     res.json(payload); //ใครส่งซ้ำมันบัคๆนะ
//   });
//   app.delete('/job/:id', (req, res) => {
//     var id = parseInt(req.params.id);

//     jobs.deleteJobByID(client, id, res);
//   });
//   app.put('/jobUpdate/:id', (req, res) => {
//     var id = parseInt(req.params.id);
//     var encryptedData = req.body.data;
//     var bytes = CryptoJS.AES.decrypt(encryptedData, '123456');
//     var payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

//     console.log(payload);
//     jobs.editJob(client, payload, id, res);
//   });
//   app.put('/jobstatus/:id', (req, res) => {
//     var id = parseInt(req.params.id);
//     let payload = req.body;
//     if (process.env.NODE_ENV === 'production') {
//       payload = decryptData(payload.data);
//     }
//     console.log(payload);
//     jobs.updateJobStatusByID(client, id, payload.Status, res);
//   });

module.exports = router;
