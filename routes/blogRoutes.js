const express = require('express');
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');
const decryptController = require('../controllers/decryptController');

const router = express.Router();

router
    .route('/')
    .get(blogController.getAllBlogs)
    .post(
        decryptController.getDecryptedData,
        authController.protect,
        blogController.createBlog
    );


router
    .route('/:id')
    .get(blogController.getBlog)
    .patch(
        decryptController.getDecryptedData,
        authController.protect,
        blogController.updateBlog
    )
    .delete(authController.protect, blogController.deleteBlog);

// Comments
router.use(authController.protect);

router
    .route('/:id/comments')
    .get(blogController.getAllComments)
    .post(decryptController.getDecryptedData, blogController.postComment)
    .delete(blogController.deleteAllComments);

router
    .route('/comment/:commentId')
    .get(blogController.getComment)
    // Front end not yet encryptData this line!!
    .patch(decryptController.getDecryptedData, blogController.editCommentById)
    .delete(blogController.deleteCommentById);

module.exports = router;