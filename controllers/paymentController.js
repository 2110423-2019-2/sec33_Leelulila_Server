const {
    mongo
} = require('../server');
const notification = require('./notificationController');
const jobController = require('./jobController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Only makeTransaction use as middleware
exports.makeTransaction = catchAsync(async (req, res, next) => {
    const jobId = req.params.id;
    const currentUser = await mongo.db("CUPartTime").collection("Job").findOne({
        _id: jobId
    })
    if (currentUser) {
        const employerEmail = currentUser.job.Employer;
        console.log(employerEmail)
        const emails = currentUser.job.CurrentAcceptedEmployee;
        const amount = parseInt(currentUser.job.Wages)
        //    console.log(emails)
        const employer = currentUser.job.Employer
        console.log(emails)
        if (emails.length == 0) {
            //res.json(`Your employee is like this[                  ], so does your love life ${emails}`)
            return next(new AppError('Not found an emails.', 404));
        }
        const findEmployer = await mongo.db("CUPartTime").collection("Users").findOne({
            email: employerEmail
        })
        if (findEmployer.wallet < amount * emails.length) {
            // res.json(`Employee has not enough money`)
            return next(new AppError('Employee has not enough money', 405));
        }
        console.log("St Balance dec")
        shiftOneWallet(amount * emails.length, employerEmail, res)
        console.log("Balance dec")
        //    shiftManyWallet(mongo, amount, emails, res)
        //    console.log(amount)
        const result = await shiftManyWallet(amount, emails, employer, res);
        const payload = {
            "timestamp": Date.now(),
            "jobId": jobId,
            "jobName": currentUser.job.JobName,
            "string": "Review " + currentUser.job.JobName + "?",
            "status": 2
        }
        await notification.notifyPayload(emails, payload);
        if (result) {
            await jobController.updateJobStatus(jobId, 'Finish', res);
            res.status(200).json(result);
        } else {
            return next(new AppError('Fail to shift wallets', 404));
        }
    } else {
        // res.json(`cannot find job with id:${jobId}`)
        return next(new AppError('Not found job with this id.', 404));
    }
});

exports.shiftOneWallet = catchAsync(async (amount, email, res) => {
    const currentUser = await mongo.db("CUPartTime").collection("Users").findOne({
        email
    });
    const balance = (currentUser.wallet - amount < 0) ? 0 : (currentUser.wallet - amount);
    const result = await mongo.db("CUPartTime").collection("Users").updateOne({
        email
    }, {
        $set: {
            wallet: balance
        }
    })
    if (result.matchedCount == 0) {
        // res.send("Cannot find user with email:", email)
        return new AppError('Not found user with email.', 404);
    }
});

exports.shiftManyWallet = catchAsync(async (amount, emails, employer, res) => {
    const result = await mongo.db("CUPartTime").collection("Users").updateMany({
        email: {
            $in: emails
        }
    }, {
        $inc: {
            wallet: amount
        }
    })
    if (result.matchedCount == 0) {
        res.json(`Can not find this email`)
        // return new AppError('Not found user with the emails.', 404);
    }
    console.log("modified wallet done")
    notifyPaymentUser(amount, emails, employer, res);
    // return 1;
});

exports.notifyPaymentUser = catchAsync(async (amount, emails, employer, res) => {
    const string = "You have been paid with the amount of " + amount.toString() + " from " + employer;
    const payload = {
        "timestamp": Date.now(),
        "wage": amount,
        "email": employer,
        "string": string,
        "status": 0

    }

    const result = await mongo.db("CUPartTime").collection("Users").updateMany({
        email: {
            $in: emails
        }
    }, {
        $push: {
            notification: payload
        }
    })
    if (result) {
        console.log('successfully notify the users')
        res.json(result);
    } else {
        console.log('unsuccessfully notify the users')
        res.json(`modified users wallet but cannot notify user`)
    }
});