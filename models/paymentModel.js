const notification = require('./notificationModel');
const jobController = require('../controllers/jobController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.shiftOneWallet = catchAsync(async (mongo, amount, email, res) => {
  const currentUser = await mongo.db('CUPartTime').collection('Users').findOne({
    email,
  });
  const balance =
    currentUser.wallet - amount < 0 ? 0 : currentUser.wallet - amount;
  const result = await mongo
    .db('CUPartTime')
    .collection('Users')
    .updateOne({
      email,
    }, {
      $set: {
        wallet: balance,
      },
    });
  if (result.matchedCount == 0) {
    // res.send("Cannot find user with email:", email)
    return new AppError('Not found user with email.', 404);
  }
});

exports.shiftManyWallet = catchAsync(async (mongo, amount, emails, employer, res) => {
  const result = await mongo
    .db('CUPartTime')
    .collection('Users')
    .updateMany({
      email: {
        $in: emails,
      },
    }, {
      $inc: {
        wallet: amount,
      },
    });
  if (result.matchedCount == 0) {
    res.json(`Can not find this email`);
    // return new AppError('Not found user with the emails.', 404);
  }
  console.log('modified wallet done');
  notifyPaymentUser(mongo, amount, emails, employer, res);
  // return 1;
});

exports.notifyPaymentUser = catchAsync(
  async (mongo, amount, emails, employer, res) => {
    const string =
      'You have been paid with the amount of ' +
      amount.toString() +
      ' from ' +
      employer;
    const payload = {
      timestamp: Date.now(),
      wage: amount,
      email: employer,
      string: string,
      status: 0,
    };

    const result = await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateMany({
        email: {
          $in: emails,
        },
      }, {
        $push: {
          notification: payload,
        },
      });
    if (result) {
      console.log('successfully notify the users');
      res.json(result);
    } else {
      console.log('unsuccessfully notify the users');
      res.json(`modified users wallet but cannot notify user`);
    }
  }
);