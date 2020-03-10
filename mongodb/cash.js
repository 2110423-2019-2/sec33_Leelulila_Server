
exports.makeTransaction = async function(client, jobId, res){
    try{
        find = await client.db("CUPartTime").collection("Job").findOne({_id:jobId})
        if(find){

           emails = find.job.CurrentAcceptedEmployee
           amount = parseInt(find.job.Wages)
           console.log(amount)
           shiftManyWallet(client, amount, emails, res)
           res.send("Shum hred na krub")
        }else{
           res.send("cannot find job with id:", jobId)
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
            res.send("Cannot find user with email:", email)
        }

    }catch(e){
        console.error(e)
    }
}
