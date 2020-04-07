const notification = require('../models/notificationModel');
const jobController = require('../models/jobModel');
const payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Only makeTransaction use as middleware
exports.makeTransaction = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const jobId = parseInt(req.params.id);
  const currentJob = await mongo.db('CUPartTime').collection('Job').findOne({
    _id: jobId,
  });

  console.log(currentJob);

  if (currentJob) {
    const employerEmail = currentJob.job.Employer;
    const emails = currentJob.job.CurrentAcceptedEmployee;
    const amount = parseInt(currentJob.job.Wages);
    const employer = currentJob.job.Employer;
    // console.log(emails);
    if (emails.length == 0) {
      // res.json(`Your employee is like this[                  ], so does your love life ${emails}`)
      return 0;
    }
    const findEmployer = await mongo
      .db('CUPartTime')
      .collection('Users')
      .findOne({
        email: employerEmail,
      });

    console.log(findEmployer);


    if (findEmployer.wallet < amount * emails.length) {
      res.json(`Employee has not enough money`)
      // return next(new AppError('Employee has not enough money', 405));
      return 0;
    }
    console.log('St Balance dec');
    await payment.shiftOneWallet(mongo, amount * emails.length, employerEmail, res);
    console.log('Balance dec');
    //    shiftManyWallet(mongo, amount, emails, res)
    //    console.log(amount)
    const result = await payment.shiftManyWallet(amount, emails, employer, res);
    const payload = {
      timestamp: Date.now(),
      jobId: jobId,
      jobName: currentJob.job.JobName,
      string: 'Review ' + currentJob.job.JobName + '?',
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