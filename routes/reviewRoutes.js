const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const decryptController = require('../controllers/decryptController');

const router = express.Router();

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        decryptController.getDecryptedData,
        authController.protect,
        reviewController.createReview
    );
// .delete(authController.protect, reviewController.deleteAllReviews);

router
    .route('/:id')
    .get(reviewController.getReview)
    .put(
        decryptController.getDecryptedData,
        authController.protect,
        reviewController.updateReview
    )
    .delete(
        authController.protect,
        reviewController.deleteReview
    );

module.exports = router;