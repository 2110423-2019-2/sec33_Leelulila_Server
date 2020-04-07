const suggestion = require('../models/suggestionModel');
const notification = require('../models/notificationModel');
const Counter = require('../models/counterModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// This function NOT use as middleware. JUST normal function
exports.updateJobStatus = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const _id = parseInt(req.params.id);
  const currentStatus = req.body.Status;

  const currentJob = await mongo.db('CUPartTime').collection('Job').findOne({
    _id,
  });

  if (currentJob) {
    currentJob.job.Status = currentStatus;
    if (currentStatus == 'Confirm') {
      pendingList = currentJob.job.CurrentEmployee;
      pending = await mongo
        .db('CUPartTime')
        .collection('Users')
        .updateMany({
          email: {
            $in: pendingList,
          },
        }, {
          $pull: {
            pendingJob: _id,
          },
        });
      currentJob.job.CurrentEmployee = [];
    } else if (currentStatus == 'Finish') {
      acceptedList = currentJob.job.CurrentAcceptedEmployee;
      await mongo
        .db('CUPartTime')
        .collection('Users')
        .updateMany({
          email: {
            $in: acceptedList,
          },
        }, {
          $pull: {
            currentJob: _id,
          },
        });
      currentJob.job.CurrentAcceptedEmployee = [];
    } else {
      return next(
        new AppError(
          `${currentStatus}, This status don't match with criteria.`,
          400
        )
      );
    }
    const result = await mongo.db('CUPartTime').collection('Job').updateOne({
      _id,
    }, {
      $set: currentJob,
    });

    if (result) {
      console.log(
        `${result.matchedCount} document(s) matched the query criteria.`
      );
      console.log(`${result.modifiedCount} document(s) was/were updated.`);
      res.status(200).json(result);
    } else {
      return next(new AppError(`Can't updata this job status.`, 404));
    }
  } else {
    return next(new AppError('Not found this job!', 404));
  }
});

exports.getAllJobs = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const result = await mongo
    .db('CUPartTime')
    .collection('Job')
    .find()
    .toArray();
  if (result) {
    res.status(200).json(result);
  } else {
    return next(new AppError(`Can't get All jobs!`, 404));
  }
});

exports.createJob = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const newJob = req.body;
  const sequenceValue = await Counter.getSequenceValue(mongo, 'jobid');
  const result = await mongo.db('CUPartTime').collection('Job').insertOne({
    _id: sequenceValue,
    job: newJob,
    notify1: [],
    notify2: [],
    notify3: [],
  });
  await mongo
    .db('CUPartTime')
    .collection('Users')
    .updateOne({
      email: newJob.Employer,
    }, {
      $push: {
        jobOwn: sequenceValue,
      },
    });
  console.log(`New Job created with the following id: ${result.insertedId}`);
  res.status(201).json(result);
});

exports.getJob = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const _id = parseInt(req.params.id);

  const result = await mongo.db('CUPartTime').collection('Job').findOne({
    _id,
  });
  if (result) {
    res.status(200).json(result);
  } else {
    return next(new AppError(`Can't get this job!`, 404));
  }
});

exports.updateJob = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const _id = parseInt(req.params.id);
  const jobData = req.body;

  let currentJob = await mongo.db('CUPartTime').collection('Job').findOne({
    _id,
  });
  if (currentJob) {
    if (
      jobData.JobDetail &&
      jobData.Wages &&
      jobData.Location &&
      jobData.BeginTime &&
      jobData.Date &&
      jobData.EndTime
    ) {
      currentJob.job.JobDetail = jobData.JobDetail;
      currentJob.job.Wages = jobData.Wages;
      currentJob.job.Location = jobData.Location;
      currentJob.job.BeginTime = jobData.BeginTime;
      currentJob.job.Date = jobData.Date;
      currentJob.job.EndTime = jobData.EndTime;
      //console.log(currentJob.job)
      const result = await mongo.db('CUPartTime').collection('Job').updateOne({
        _id,
      }, {
        $set: currentJob,
      });

      if (result) {
        res.status(200).json(result);
      } else {
        return next(new AppError(`Can't update this job.`), 404);
      }
    } else {
      return next(new AppError('Please provide enough information.'), 400);
    }
  } else {
    return next(new AppError(`Can't find this job with id: ${_id}`), 404);
  }
});

exports.deleteJob = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const _id = parseInt(req.params.id);
  const currentJob = await mongo.db('CUPartTime').collection('Job').findOne({
    _id,
  });
  if (!currentJob) {
    // console.log(`No Job with the ID '${id}':`);
    // res.send('fail');
    return next(new AppError('Not found this job!', 404));
  }
  const employer = currentJob.job.Employer;
  const pendingList = currentJob.job.CurrentEmployee;
  const acceptedList = currentJob.job.CurrentAcceptedEmployee;
  const result = await mongo.db('CUPartTime').collection('Job').deleteOne({
    _id,
  });
  if (result) {
    console.log(`Deleted Job with the ID: ${id}`);
    const pending = await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateMany({
        email: {
          $in: pendingList,
        },
      }, {
        $pull: {
          pendingJob: id,
        },
      });
    const accepted = await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateMany({
        email: {
          $in: acceptedList,
        },
      }, {
        $pull: {
          currentJob: id,
        },
      });
    await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateOne({
        email: employer,
      }, {
        $pull: {
          jobOwn: id,
        },
      });
    await notification.notifyMany(
      mongo,
      pendingList,
      find.job.JobName + ' which you applied has been deleted'
    );
    await notification.notifyMany(
      acceptedList,
      find.job.JobName + ' has been deleted'
    );
    console.log(pending.modifiedCount);
    console.log(accepted.modifiedCount);
    // res.send('success');
    return res.status(200).json();
  } else {
    // console.log(`No Job with the ID '${id}':`);
    // res.send('fail');
    return next(new AppError('Not found this job!', 404));
  }
});

// exports.getJobStatus = catchAsync(async (req, res, next) => {
//     res.json();
// });

// exports.getEmployee = catchAsync(async (req, res, next) => {
//     res.json();
// });

exports.updateEmployeeByEmail = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const _id = parseInt(req.params.id);
  const email = req.body.Email;
  let currentJob = await mongo.db('CUPartTime').collection('Job').findOne({
    _id,
  });
  if (currentJob) {
    const updatedUser = await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateOne({
        email,
      }, {
        $push: {
          pendingJob: _id,
        },
      });
    suggestion.addTFvector(mongo, email, currentJob.job.TFvector);
    console.log(updatedUser.modifiedCount);
    if (updatedUser.matchedCount == 0) {
      return next(new AppError(`Not found user with the email: ${email}`, 400));
    }
    currentJob.job.CurrentEmployee.push(email);
    console.log(currentJob)
    const result = await mongo.db('CUPartTime').collection('Job').updateOne({
      _id,
    }, {
      $set: currentJob,
    });
    await notification.jobNotify(mongo, _id, currentJob.job.Employer, 0);
    console.log(
      `${result.matchedCount} document(s) matched the query criteria.`
    );
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
    res
      .status(200)
      .json(`${result.matchedCount} document(s) matched the query criteria.`);
  } else {
    return next(
      new AppError('No document(s) matched the query criteria.', 400)
    );
  }
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const jobId = parseInt(req.params.id);
  const email = req.body;
  const currentJob = await mongo.db('CUPartTime').collection('Job').findOne({
    _id: jobId,
  });
  if (currentJob.job.CurrentEmployee) {
    // input email in current employee
    const idx = currentJob.job.CurrentEmployee.indexOf(email);
    console.log(idx);
    if (idx > -1) {
      currentJob.job.CurrentEmployee.splice(idx, 1);
    } else {
      return next(new AppError('This job has no current employee.', 404));
    }
    const result = await mongo.db('CUPartTime').collection('Job').updateOne({
      _id: jobId,
    }, {
      $set: currentJob,
    });
    await notification.jobNotify(mongo, jobId, email, 1);
    res.status(200).json(result);
  } else {
    return next(new AppError(`Not found this job!`), 404);
    // console.log('cannot find job by:', jobId);
  }
});

exports.updateAcceptedEmployeeByEmail = catchAsync(async (req, res, next) => {
  const mongo = req.app.locals.db;
  const _id = parseInt(req.params.id);
  const email = req.body.Email;

  let currentJob = await mongo
    .db('CUPartTime')
    .collection('Job')
    .findOne({
      _id
    });

  if (currentJob) {
    const amt = parseInt(currentJob.job.Amount);
    if (currentJob.job.CurrentAcceptedEmployee.length + 1 > amt) {
      console.log('Reach maximum employee!');
      return next(new AppError('Reach max employee!', 405));
    }
    //remove the job from pending list also validate the email
    const updatedUser = await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateOne({
        email,
      }, {
        $pull: {
          pendingJob: _id,
        },
      });
    if (updatedUser.matchedCount == 0) {
      return next(new AppError('Not found user with the email', 404));
    }
    //the email is valid
    await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateOne({
        email,
      }, {
        $push: {
          currentJob: _id,
        },
      });
    const idx = currentJob.job.CurrentEmployee.indexOf(email);
    // console.log(email);
    if (idx > -1) {
      currentJob.job.CurrentEmployee.splice(idx, 1);
    }
    //push to job after everything is confirmed
    currentJob.job.CurrentAcceptedEmployee.push(email);
    console.log(currentJob.job.CurrentAcceptedEmployee);
    const result = await mongo.db('CUPartTime').collection('Job').updateOne({
      _id,
    }, {
      $set: currentJob,
    });
    await mongo
      .db('CUPartTime')
      .collection('Job')
      .updateOne({
        _id,
      }, {
        $push: {
          notify1: email,
        },
      });
    await notification.jobNotify(mongo, _id, email, 2);
    console.log(
      `${result.matchedCount} document(s) matched the query criteria.`
    );
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
    res
      .status(200)
      .json(`${result.matchedCount} document(s) matched the query criteria.`);
  } else {
    console.log('Can not find the job by id:', _id);
    return next(
      new AppError('No document(s) matched the query criteria.', 400)
    );
  }
});