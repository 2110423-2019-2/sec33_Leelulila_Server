const Counter = require('../models/counterModel');
const AppError = require('../utils/appError');

exports.getAllReviews = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const result = await mongo
      .db('CUPartTime')
      .collection('Reviews')
      .find({})
      .toArray();
    if (result) {
      console.log('Reviews found, returning all reviews');
      return res.status(200).json(result);
    } else {
      console.log('fail to find reviews');
      return next(new AppError('Not found any reviews.'), 404);
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    let review = req.body;
    const sequenceValue = await Counter.getSequenceValue(mongo, 'reviewid');

    review._id = sequenceValue;
    review.timestamp = Date.now();
    result = await mongo
      .db('CUPartTime')
      .collection('Reviews')
      .insertOne(review);
    await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateOne({
        email: review.WriterEmail,
      }, {
        $push: {
          reviewOwn: sequenceValue,
        },
      });
    if (result) {
      console.log('review created with id', sequenceValue);
      res.status(200).json(result);
    } else {
      console.log('fail to create review');
      return next(new AppError('Can not create a review.'), 404);
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const _id = req.params.id;
    const result = await mongo.db('CUPartTime').collection('Reviews').findOne({
      _id,
    });
    if (result) {
      console.log('Review', _id, 'found, returning review');
      res.status(200).json(result);
    } else {
      console.log('fail to find review');
      return next(new AppError('Can not get review with this id.'), 404);
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const _id = parseInt(req.params.id);
    const newReview = req.body;
    const result = await mongo.db('CUPartTime').collection('Reviews').updateOne({
      _id,
    }, {
      $set: newReview,
    });
    if (result) {
      console.log('Reviews', _id, 'edited');
      res.status(200).json(result);
    } else {
      console.log('fail to edit review');
      return next(new AppError('Can not edit this review.'), 404);
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const _id = parseInt(req.params.id);
    const result = await mongo
      .db('CUPartTime')
      .collection('Reviews')
      .deleteOne({
        _id,
      });
    if (result) {
      console.log('Review', _id, 'was been deleted');
      res.status(204).json();
    } else {
      console.log('fail to delete review');
      return next(new AppError('Can not delete this review.', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};