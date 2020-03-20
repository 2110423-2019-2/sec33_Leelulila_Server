
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
exports.notifyIncomingJob = async function(client){
    try{
        find = await client.db("CUPartTime").collection("Job").find({})
        //console.log(find)
        find.forEach(async function(jobs) { 
            if(jobs.job.BeginTime){
                if(jobs.job.CurrentAcceptedEmployee.length > 0){
                    //')
                    beginTime = jobs.job.BeginTime
                    
                    year = jobs.job.Date.substring(0,4)
                    month = jobs.job.Date.substring(5,7)
                    day = jobs.job.Date.substring(8,10)
                    
                    date = year+'-'+month+'-'+day
                    time = "T"+beginTime+":00"
                    jobTime = Date.parse(date+time)
                    now = Date.now()
                    console.log(jobTime - now, date, time, jobs._id)
                    if(jobTime - now > 0){
                        msg = ""
                        length = jobTime - now
                        if(length < 259200000 && length> 86400000 ){
                            emails = jobs.notify1
                            if(length>86400000*2){
                                count = 3
                            } else{
                                count = 2
                            }
                            msg = "Your work at "+jobs.job.JobName+" starts in "+count+" days"
                            payload = {
                                "timestamp": Date.now(),
                                "string":msg,
                                "status": 0
                    
                            }
                            result = await client.db("CUPartTime").collection("Users").updateMany({email : { $in : emails}},{$push : {notification : payload}})
                            if(result.modifiedCount > 0){
                                console.log("notified",msg)
                            }
                           await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$pull:{notify1 : {$in : emails}}})
                           await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$push:{notify2 : {$each : emails}}})
                        }else if(length < 86400000 && length > 43200000 ){
                            nmails = []
                            if(jobs.notify1.length>0){
                                nmails = jobs.notify1
                                await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$pull:{notify1 : {$in : nmails}}})
                                await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$push:{notify2 : {$each : nmails}}})
                            }
                            emails = jobs.notify2.concat(nmails)
                            msg = "Your work at "+jobs.job.JobName+" starts in 1 day"
                            payload = {
                                "timestamp": Date.now(),
                                "string":msg,
                                "status": 0
                    
                            }
                            result = await client.db("CUPartTime").collection("Users").updateMany({email : { $in : emails}},{$push : {notification : payload}})
                            if(result.modifiedCount > 0){
                                console.log("notified",msg)
                            }
                            await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$pull:{notify2 : {$in : emails}}})
                            await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$push:{notify3 : {$each : emails}}})
                        }else if(length< 43200000){
                            
                            nmails1 = []
                            nmails2 = []
                            if(jobs.notify1.length>0){
                                nmails1 = jobs.notify1
                                await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$pull:{notify1 : {$in : nmails1}}})
                                await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$push:{notify3 : {$each : nmails1}}})
                                console.log('eiei')
                            }
                            if(jobs.notify2.length>0){
                                nmails2 = jobs.notify2
                                await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$pull:{notify2 : {$in : nmails2}}})
                                await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$push:{notify3 : {$each : nmails2}}})
                            }
                            emails = jobs.notify3.concat(nmails1)
                            emails = emails.concat(nmails2)
                            msg = "Your work at "+jobs.job.JobName+" starts in 12 hours"
                            payload = {
                                "timestamp": Date.now(),
                                "string":msg,
                                "status": 0
                    
                            }
                            console.log(emails, jobs._id)
                            await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$pull:{notify3 : {$in : emails}}})
                            result3 = await client.db("CUPartTime").collection("Users").updateMany({email : { $in : emails}},{$push : {notification : payload}})
    
                            if(result3.modifiedCount>0){
                                console.log("successfully notify 12 hours")
                            }
                           
    
                        }
                    }else{
                        //late for work ?
                        if(jobs.notify1.length>0){
                            nmails = jobs.notify1
                            await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$pull:{notify1 : {$in : nmails}}})
                            await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$push:{notify3 : {$each : nmails}}})
                        }
                        if(jobs.notify2.length>0){
                            nmails = jobs.notify2
                            await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$pull:{notify2 : {$in : nmails}}})
                            await client.db("CUPartTime").collection("Job").updateOne({_id:jobs._id},{$push:{notify3 : {$each : nmails}}})
                        }
                    }
                }
            }else{
            
                console.log('job corrupted')
            }

        } );
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
        result = await client.db("CUPartTime").collection("Users").updateMany({email : { $in : email}},{$push : {notification : payload}})
        if(result){
            console.log("notified the users")
        }else{
            console.log("fail to notify the user")
        }
    }catch(e){
        console.error(e)
    }

}