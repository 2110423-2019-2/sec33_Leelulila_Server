const AppError = require('../utils/appError');

exports.shiftOneWallet = (async (mongo, amount, email, res) => {
  try {
    const currentUser = await mongo.db('CUPartTime').collection('Users').findOne({
      email,
    });
    const balance =
      currentUser.wallet - amount < 0 ? 0 : currentUser.wallet - amount;
    // console.log('balance: ', balance);
    // console.log('email: ', email);

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
    // console.log(result);

    if (result.matchedCount == 0) {
      // res.send("Cannot find user with email:", email)
      return new AppError('Not found user with email.', 404);
    }
  } catch (err) {
    throw new Error(err.message);
  }
});

// payment.shiftManyWallet(mongo, amount, emails, employer, res);

exports.shiftManyWallet = (async (mongo, amount, emails, employer, res) => {
  try {

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
    await notifyPaymentUser(mongo, amount, emails, employer, res);
    return 1;
  } catch (err) {
    throw new Error(err.message);
  }
});

const notifyPaymentUser = (
  async (mongo, amount, emails, employer, res) => {
    try {
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
        // res.json(result);
      } else {
        console.log('unsuccessfully notify the users');
        // res.json(`modified users wallet but cannot notify user`);
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }
);