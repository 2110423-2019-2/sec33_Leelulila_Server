
const notify = require('./notify.js')
exports.makeTransaction = async function (client, jobId, res) {
    try {
        find = await client.db("CUPartTime").collection("Job").findOne({ _id: jobId })
        if (find) {
            employerEmail = find.job.Employer;
            console.log(employerEmail)
            emails = find.job.CurrentAcceptedEmployee;
            amount = parseInt(find.job.Wages)
            //    console.log(emails)
            employer = find.job.Employer
            console.log(emails)
            if (emails.length == 0) {

                res.json(`Your employee is like this[                  ], so does your love life ${emails}`)
                return 0
            }
            console.log("St Balance dec")
            shiftOneWallet(client, amount * emails.length, employerEmail, res)
            console.log("Balance dec")
            //    shiftManyWallet(client, amount, emails, res)

            //    console.log(amount)

            result = shiftManyWallet(client, amount, emails, employer, res)
            payload = {
                "timestamp": Date.now(),
                "jobId": jobId,
                "jobName": find.job.JobName,
                "string": "Review job " + find.job.JobName + "?",
                "status": 2
            }
            notify.notifyPayload(client, emails, payload)

            if (result) {
                return 1
            } else {
                return 0
            }

        } else {

            res.json(`cannot find job with id:${jobId}`)
            return 0
        }
    } catch (e) {
        console.error(e)
    }
}
async function shiftOneWallet(client, amount, email, res) {
    try {
        find = await client.db("CUPartTime").collection("Users").findOne({ email: email });
        balance = (find.wallet - amount < 0) ? 0 : (find.wallet - amount);
        result = await client.db("CUPartTime").collection("Users").updateOne({ email: email }, { $set: { wallet: balance } })
        if (result.matchedCount == 0) {
            res.send("Cannot find user with email:", email)
        }

    } catch (e) {
        console.error(e)
    }
}

async function shiftManyWallet(client, amount, emails, employer, res) {
    try {
        result = await client.db("CUPartTime").collection("Users").updateMany({ email: { $in: emails } }, { $inc: { wallet: amount } })
        if (result.matchedCount == 0) {
            res.json(`cannot find this email`)
            return 0
        }
        console.log("modified wallet done")

        notifyCashUser(client, amount, emails, res)
        return 1
    } catch (e) {
        console.error(e)
    }
}
async function notifyCashUser(client, amount, emails, res) {
    try {
        var string = "You have been paid with the amount of " + amount.toString()
        payload = {
            "timestamp": Date.now(),
            "wage": amount,
            "email": employer,
            "string": string,
            "status": 0

        }

        result = await client.db("CUPartTime").collection("Users").updateMany({ email: { $in: emails } }, { $push: { notification: payload } })
        if (result) {
            console.log('successfully notify the users')

            res.json(payload)
        } else {
            console.log('unsuccessfully notify the users')
            res.json(`modified users wallet but cannot notify user`)
        }
    } catch (e) {

    }
}

