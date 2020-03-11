
exports.makeTransaction = async function(client, jobId, res){
    try{
        find = await client.db("CUPartTime").collection("Job").findOne({_id:jobId})
        if(find){

           emails = find.job.CurrentAcceptedEmployee
           amount = parseInt(find.job.Wages)
           console.log(emails)
           if(emails.length == 0){
            
                res.json(`Your employee is like this[                  ], so does your love life ${emails}`)
               return
           }
           console.log(amount)
           
           shiftManyWallet(client, amount, emails, res)
          

        }else{
            
           res.json(`cannot find job with id:${jobId}`)
        }
    }catch(e){
        console.error(e)
    }
}
exports.shiftOneWallet = async function (client, amount, email, res){
    try{
        result = await client.db("CUPartTime").collection("Users").updateOne({email:email},{$inc : {wallet : amount}})
        if(result.matchedCount==0){
            res.send("Cannot find user with email:", email)
        }

    }catch(e){
        console.error(e)
    }
}

async function shiftManyWallet(client, amount, emails, res){
    try{
        result = await client.db("CUPartTime").collection("Users").updateMany({email : { $in : emails}},{$inc : {wallet : amount}})
        if(result.matchedCount==0){
           res.json(`cannot find this email`)
           return
        }
        console.log("modified wallet done")
        res.json(`modified users wallet`)
    }catch(e){
        console.error(e)
    }
}
