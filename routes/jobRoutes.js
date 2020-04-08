const express = require('express');
const jobController = require('../controllers/jobController');
const authController = require('../controllers/authController');
const decryptController = require('../controllers/decryptController');

const router = express.Router();

router
  .route('/')
  .get(jobController.getAllJobs)
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
  .put(decryptController.getDecryptedData, authController.protect, jobController.updateJobStatus);

router
  .route('/employee/:id')
  .put(
    decryptController.getDecryptedData,
    authController.protect,
    jobController.updateEmployeeByEmail
  )
  .delete(
    decryptController.getDecryptedData,
    // authController.protect,
    jobController.deleteEmployee
  );

router.put(
  '/:id/addAcceptedEmployee',
  decryptController.getDecryptedData,
  authController.protect,
  jobController.updateAcceptedEmployeeByEmail
);

module.exports = router;