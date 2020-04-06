const express = require('express');
const jobController = require('../controllers/jobController');
const authController = require('../controllers/authController');
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
// router.use(authController.protect);

router
  .route('/:id')
  .get(jobController.getJob)
  .put(decryptController.getDecryptedData, authController.protect, jobController.updateJob)
  .delete(authController.protect, jobController.deleteJob);

router
  .route('/jobstatus/:id')
  // .get(jobController.getJobStatus)
  .put(decryptController.getDecryptedData, authController.protect, jobController.updateJobStatus);

router
  .route('/:id/employee')
  .put(
    decryptController.getDecryptedData,
    authController.protect,
    jobController.updateEmployeeByEmail
  );

router.put(
  '/:id/addAcceptedEmployee',
  decryptController.getDecryptedData,
  authController.protect,
  jobController.updateAcceptedEmployeeByEmail
);

router.delete(
  '/employee/:id',
  decryptController.getDecryptedData,
  authController.protect,
  jobController.deleteEmployee
);

module.exports = router;