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

module.exports = router;