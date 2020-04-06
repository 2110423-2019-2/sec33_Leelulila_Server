const notification = require('../models/notificationModel');
const jobController = require('./jobController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Only makeTransaction use as middleware
exports.makeTransaction = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const jobId = req.params.id;
  const currentUser = await mongo.db('CUPartTime').collection('Job').findOne({
    _id: jobId,
  });
  if (currentUser) {
    const employerEmail = currentUser.job.Employer;
    console.log(employerEmail);
    const emails = currentUser.job.CurrentAcceptedEmployee;
    const amount = parseInt(currentUser.job.Wages);
    //    console.log(emails)
    const employer = currentUser.job.Employer;
    console.log(emails);
    if (emails.length == 0) {
      //res.json(`Your employee is like this[                  ], so does your love life ${emails}`)
      return next(new AppError('Not found an emails.', 404));
    }
    const findEmployer = await mongo
      .db('CUPartTime')
      .collection('Users')
      .findOne({
        email: employerEmail,
      });
    if (findEmployer.wallet < amount * emails.length) {
      // res.json(`Employee has not enough money`)
      return next(new AppError('Employee has not enough money', 405));
    }
    console.log('St Balance dec');
    shiftOneWallet(mongo, amount * emails.length, employerEmail, res);
    console.log('Balance dec');
    //    shiftManyWallet(mongo, amount, emails, res)
    //    console.log(amount)
    const result = await shiftManyWallet(amount, emails, employer, res);
    const payload = {
      timestamp: Date.now(),
      jobId: jobId,
      jobName: currentUser.job.JobName,
      string: 'Review ' + currentUser.job.JobName + '?',
      status: 2,
    };
    await notification.notifyPayload(mongo, emails, payload);
    if (result) {
      await jobController.updateJobStatus(mongo, jobId, 'Finish', res);
      res.status(200).json(result);
    } else {
      return next(new AppError('Fail to shift wallets', 404));
    }
  } else {
    // res.json(`cannot find job with id:${jobId}`)
    return next(new AppError('Not found job with this id.', 404));
  }
});