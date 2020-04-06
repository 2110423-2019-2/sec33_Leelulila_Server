
const notify = require('./notify.js')

const {PaymentNotification, ReviewNotification} = require('./notifyOOP.js')

exports.makeTransaction = async function(client, jobId, res){
    try{
        find = await client.db("CUPartTime").collection("Job").findOne({_id:jobId})
        if(find){
           employerEmail = find.job.Employer;
           console.log(employerEmail)
           emails = find.job.CurrentAcceptedEmployee;
           amount = parseInt(find.job.Wages)
           employer = find.job.Employer
           console.log(emails)
           if(emails.length == 0){
            
               return 0
           }
        findEmployer = await client.db("CUPartTime").collection("Users").findOne({email:employerEmail})
        if(findEmployer.wallet <  amount*emails.length){
            res.json(`Employee has not enough money`)
            return 0
        }


        console.log("St Balance dec")
        shiftOneWallet(client, amount*emails.length, employerEmail, res)
        console.log("Balance dec")
    
           
        result = shiftManyWallet(client, amount, emails,employer, res)
    
        let noti = new ReviewNotification(jobId, find.job.JobName);
        noti.notify(client, emails);
           
          if(result){
              return 1
          }else{
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

async function shiftManyWallet(client, amount, emails,employer, res){
    try{
        result = await client.db("CUPartTime").collection("Users").updateMany({email : { $in : emails}},{$inc : {wallet : amount}})
        if(result.matchedCount==0){
           //res.json(`cannot find this email`)
           return 0
        }
        console.log("modified wallet done")

        //notifyCashUser(client, amount, emails, employer,  res)
        let noti = new PaymentNotification(amount, employer)
        noti.notify(client, emails);
        return 1
    } catch (e) {
        console.error(e)
    }
}

