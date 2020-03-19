
exports.readNotify = async function(client, email, res){
    try{
    result = await client.db("CUPartTime").collection("Users").updateOne({email:email},{$set:{"notification.$[].status": 1}})
    if(result.modifiedCount >0){
        res.json(`successfull`)
    }else{
        res.json('fail')
    }
    }catch(e){
        console.error(e)
    }
}
exports.jobNotify = async function(client, email,jobId, type){
    try{
        find = await client.db("CUPartTime").collection("Job").findOne({_id:jobId})
        console.log(type)
        jobName = find.job.JobName
        if(type == 0){
            var string = "Your job "+jobName+" has a new applicant"
            payload = {
                "timestamp": Date.now(),
                "string":string,
                "status": 0
            }
        }
        else if(type == 1){
            var string = "Sadly, your application for "+jobName+" has been refused, good luck next time!"
            payload = {
                "timestamp": Date.now(),
                "string":string,
                "status": 0
            }

        }else if(type == 2){
            var string = "Congratulations you has been accepted to "+jobName
            payload = {
                "timestamp": Date.now(),
                "string":string,
                "status": 0
            }
        }else{
            console.log("error unknown type")
            return
        }
        result = await client.db("CUPartTime").collection("Users").updateMany({email : email},{$push : {notification : payload}})
        if(result){
            console.log('successfully notify ', email)
        }else{
            console.log('fail to notify')
        }

    }catch(e){
        console.error(e)

    }
}
exports.notifyMany = async function(client,email,msg){
    try{
        payload = {
            "timestamp": Date.now(),
            "string":msg,
            "status": 0

        }
        result = await client.db("CUPartTime").collection("Users").updateMany({email : { $in : emails}},{$push : {notification : payload}})
        if(result){
            console.log("notified the users")
        }else{
            console.log("fail to notify the user")
        }
    }catch(e){
        console.error(e)
    }

}