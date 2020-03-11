

const calendar = require('./calendar.js')
const cash  = require('./cash.js')
const express = require('express')
const app = express()

var cors = require('cors');


// app.use(cors);

app.use(express.json());


async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
async function getNextSequenceValue(client, sequenceName){
    result = await client.db("CUPartTime").collection("counters").findOne({ _id : sequenceName });
    await client.db("CUPartTime").collection("counters").updateOne({ _id : sequenceName }, { $inc: {sequence_value : 1 }});
   console.log(result.sequence_value)
     
    return result.sequence_value
 }

//CREATE
/////////////////////////////////////////////////////////////////////////////////////////
async function createUser(client, newUser,res){
    try{
    const sequenceName = "productid"
    const id = await client.db("CUPartTime").collection("counters").findOne({ _id : sequenceName });
    await client.db("CUPartTime").collection("counters").updateOne({ _id : sequenceName }, { $inc: {sequence_value : 1 }});
    newUser._id = id.sequence_value
    newUser.currentJob = []
    newUser.pendingJob = []
    newUser.notification  = []
    newUser.wallet = 0
    const result = await client.db("CUPartTime").collection("Users").insertOne(newUser);
    calendar.createCalendar(client, newUser.Email)
    console.log(`New User created with the following id: ${result.insertedId}`);
    res.json(`New User created with the following id: ${result.insertedId}`);
    }catch(e){
        console.error(e)
    }
}

async function createJob(client, newJob,res){
    try{
    const sequenceName = "jobid"
    const id = await client.db("CUPartTime").collection("counters").findOne({ _id : sequenceName });
    await client.db("CUPartTime").collection("counters").updateOne({ _id : sequenceName }, { $inc: {sequence_value : 1 }});
    // newJob._id = id.sequence_value
    
    var jobNo = "J" + id.sequence_value;
    const result = await client.db("CUPartTime").collection("Job").insertOne({_id:id.sequence_value, job:newJob});
    console.log(`New Job created with the following id: ${result.insertedId}`);
    res.json(`New Job created with the following id: ${result.insertedId}`);
    
    }catch(e){
        console.error(e)
    }
}

/////////////////////////////////////////////////////////////////////////////////////////

//READ
/////////////////////////////////////////////////////////////////////////////////////////
async function findUserByID(client, id, res){
    result = await client.db("CUPartTime").collection("Users").findOne({ _id: id }
        );
         
    if (result) {
        console.log(`Found user(s) with the name '${id}':`);
        console.log(result);
        res.json(result)
    } 
    else {
        console.log(`No user found with the name '${id}'`);                   
    }
    return result;
    
}   

async function findUserByEmail(client, email, res){
    result = await client.db("CUPartTime").collection("Users").findOne({ email: email }
        );
        console.log(result); 
    if (result) {
        
        console.log(`Found user(s) with the name '${email}':`);
        console.log(result);
        res.json(result)
    } 
    else {
        console.log(`No user found with the name '${email}'`);                   
    }
    return result;
    
}  

async function findAllJob(client, res){
    try{
    result = await client.db("CUPartTime").collection("Job").find({}).toArray();
    console.log('ee')
    if (result) {
        res.json(result);
        console.log(result)
    } 
    else {
        console.log(`No user found with the nam`);                   
    }}catch(e){
        console.error(e)
    }


}   
async function findJobByID(client, id,res){

    
    try{
        
        result = await client.db("CUPartTime").collection("Job").findOne({_id:id})
        
        if (result) {
            res.json(result);
        } 
        else {
            console.log(`No user found with the nam`);    
                        
        }
    }catch(e){
        console.error(e)
    }


}   
/////////////////////////////////////////////////////////////////////////////////////////

//UPDATEl
/////////////////////////////////////////////////////////////////////////////////////////
async function updateUserByID(client, id, updatedName, res) {
    try{
    result = await client.db("CUPartTime").collection("Users")
                        .updateOne({ _id: id }, { $set:  updatedName });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
    //res.json(`${result.modifiedCount} document(s) was/were updated.`);
    res.json(`${result.matchedCount} document(s) matched the query criteria.`);
    }catch(e){
        console.error(e)
    }
}
async function updateJobStatusByID(client, id, status, res) {
    try{
    const find = await client.db("CUPartTime").collection("Job").findOne({_id:id});
    find.job.Status = status
    result = await client.db("CUPartTime").collection("Job")
                        .updateOne({ _id: id }, { $set: find  });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
    //res.json(`${result.modifiedCount} document(s) was/were updated.`);
    //res.json()
    res.json(`${result.matchedCount} document(s) matched the query criteria.`);
    }catch(e){
        console.error(e)
    }
}
async function editJob(client, payload, id,res){
    try{
        find = await client.db("CUPartTime").collection("Job").findOne({_id:id})
        if(find){
            if(payload.JobDetail &&payload.Wages&&payload.Location&&payload.BeginTime&&payload.Date&&payload.EndTime){
            find.job.JobDetail = payload.JobDetail 
            find.job.Wages = payload.Wages
            find.job.Location = payload.Location
            find.job.BeginTime = payload.BeginTime
            find.job.Date = payload.Date
            find.job.EndTime = payload.EndTime
            //console.log(find.job)
            result = await client.db("CUPartTime").collection("Job").updateOne({_id:id},{$set:find})
            if(result){
                res.json(`ok`)
            }else{
                res.json(`fail`)
            }
        }else{
            res.json(`fail not enough data`)
        }
    }else{
        res.json(`fail no job with the id ${id}`)
    }
    }catch(e){
        console.log(e)
    }
}
async function updateJobEmployeeByEmail(client, id, email, res) { //
    try{
        const find = await client.db("CUPartTime").collection("Job").findOne({_id:id});
        if(find){
        
            console.log(email)
            
            insert = await client.db("CUPartTime").collection("Users").updateOne({email:email}, {$push : {pendingJob : id}})
            console.log(insert.modifiedCount)
            if(insert.matchedCount==0){
                
                res.json(`No user with the email ${email}`)
                return 
            }
            find.job.CurrentEmployee.push(email)
            result = await client.db("CUPartTime").collection("Job")
                                .updateOne({ _id: id }, { $set : find  });

            console.log(`${result.matchedCount} document(s) matched the query criteria.`);
            console.log(`${result.modifiedCount} document(s) was/were updated.`);
            //res.json(`${result.modifiedCount} document(s) was/were updated.`);
            //res.json()
            res.json(`${result.matchedCount} document(s) matched the query criteria.`);
        }else{
            res.json(`No document(s) matched the query criteria.`);
        }
    }catch(e){
        console.error(e)
    }
}

async function updateJobAcceptedEmployeeByEmail(client, id, email, res) {
    try{
    const find = await client.db("CUPartTime").collection("Job").findOne({_id:id});
    if(find){
        amt = parseInt(find.job.Amount)
        if(find.job.CurrentAcceptedEmployee.length + 1 > amt){
            console.log("reach maximum employee")
            res.json(`reach max employee`)
            return
        }
        //remove the job from pending list also validate the email
        remove = await client.db("CUPartTime").collection("Users").updateOne({email:email}, {$pull : {pendingJob : id}})
        if(remove.matchedCount==0){          
            res.json(`No user with the email ${email}`)
            return
        }
        //the email is valid
        await client.db("CUPartTime").collection("Users").updateOne({email:email}, {$push : {currentJob : id}})
        //push to job after everything is confirmed
        find.job.CurrentAcceptedEmployee.push(email)
        
        result = await client.db("CUPartTime").collection("Job")
                            .updateOne({ _id: id }, { $set : find  });

        console.log(`${result.matchedCount} document(s) matched the query criteria.`);
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
        //res.json(`${result.modifiedCount} document(s) was/were updated.`);
        //res.json()
        res.json(`${result.matchedCount} document(s) matched the query criteria.`);
    }else{
        console.log("cannot find the job by id:", id)
        res.json(`No document(s) matched the query criteria.`);
    }
    }catch(e){
        console.error(e)
    }
}
/////////////////////////////////////////////////////////////////////////////////////////

//DELETE
/////////////////////////////////////////////////////////////////////////////////////////
async function deleteJobByID(client, id, res){
    try{
        find = await client.db("CUPartTime").collection("Job").findOne({_id:id})
        if(find == null){
            console.log(`No Job with the ID '${id}':`)
            res.send("fail")
        }
        pendingList =find.job.CurrentEmployee
        acceptedList = find.job.CurrentAcceptedEmployee
        result = await client.db("CUPartTime").collection("Job").deleteOne({_id : id})
        if(result){
            console.log(`Deleted Job with the ID '${id}':`)
            pending = await client.db("CUPartTime").collection("Users").updateMany({email : {$in : pendingList}},{$pull : {pendingJob : id}})
            accepted = await client.db("CUPartTime").collection("Users").updateMany({email : {$in : acceptedList}},{$pull : {currentJob : id}})
            console.log(pending.modifiedCount)
            console.log(accepted.modifiedCount)
            res.send("success")
        }
        else{
            console.log(`No Job with the ID '${id}':`)
            res.send("fail")
        }
    }catch(e){
        console.error(e)
    }
}
async function deleteCurrentEmployeeByID(client, jobID, email, res){
    try{
        find = await client.db("CUPartTime").collection("Job").findOne({_id:jobID});
        //console.log(find.CurrentEmployee)
        if(find.job.CurrentEmployee != null){
            
            const idx = find.job.CurrentEmployee.indexOf(email)
            console.log(idx)
            if(idx > -1){
                find.job.CurrentEmployee.splice(idx, 1)
            }else{
                res.json(`This job has no Email ${email}`)
                return
            }
            result = await client.db("CUPartTime").collection("Job").updateOne({_id:jobID},{$set :find});
            res.json(`Successfull`)
            console.log('Successfull')
        }else{
            res.json(`cannot find the job by id`)
            console.log('cannot find job by', jobID)
        }
    }catch(e){
        console.error(e)
    }
}
/////////////////////////////////////////////////////////////////////////////////////////
async function main(){
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://admin:cuparttime2020@cluster0-rjut3.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });
    
    
    //connect to db eiei
    try {
        await client.connect();


        //await client.db("CUPartTime").collection("Users").createIndex({email : 1},{unique : true});
       // await listDatabases(client);
        //await client.db("CUPartTime").collection("Users").updateMany({}, {$set :{notification :[]}})
        //await createUser(client,{name: "uouoeiei"});
       // await updateUserByName(client, "Somnuk", {name : "Drive"});
       // await findUserByName(client, "Somnuk");
        
    }
    catch(e) {
        console.error(e);
    }
//USER
/////////////////////////////////////////////////////////////////////////////////////////
    app.get('/user/:id', (req, res) => { //get all list of db
        var id = parseInt(req.params.id)
        findUserByID(client, id, res)
    })
    app.get('/useremail/:email', (req, res) => { //get all list of db
        res.header('Access-Control-Allow-Origin', "*");
        var email = req.params.email
        findUserByEmail(client, email, res)
    })
    app.post('/newuser', (req, res) => {
        var payload = req.body;
        console.log(payload)
        createUser(client, payload, res)
      })
    app.put('/user/:id', (req, res) => {
        var id = parseInt(req.params.id)
        var payload = req.body
        updateUserByID(client, id, payload, res)
      })
/////////////////////////////////////////////////////////////////////////////////////////

//JOB
/////////////////////////////////////////////////////////////////////////////////////////
     app.get('/job/:id', (req, res) => { //get all list of db
        res.header('Access-Control-Allow-Origin', "*");
        var id = parseInt(req.params.id)
        
        findJobByID(client, id, res)
    })
    app.post('/newjob', (req, res) => {
        var payload = req.body;
        console.log(payload)
        createJob(client, payload, res)
        //res.json(payload)
    })
    app.delete('/job/:id', (req, res) => { 
        var id = parseInt(req.params.id)
        
        deleteJobByID(client, id, res)
    })
    app.put('/job/:id', (req, res) => {
        var id = parseInt(req.params.id)
        var payload = req.body
        console.log(payload);
        editJob(client, payload,id, res)
    })
    app.put('/jobstatus/:id', (req, res) => {
        var id = parseInt(req.params.id)
        var payload = req.body
        console.log(payload);
        updateJobStatusByID(client, id, payload.Status, res)
    })

    app.put('/job/addemployee/:id', (req, res) => {
        // res.header('Access-Control-Allow-Origin', "*");
        var id = parseInt(req.params.id);
        console.log(id)
        var payload = req.body;
        console.log(payload.Email)
        updateJobEmployeeByEmail(client, id, payload.Email, res)
    })

    app.put('/job/addacceptedemployee/:id', (req, res) => {
        // res.header('Access-Control-Allow-Origin', "*");
        var id = parseInt(req.params.id);
        console.log(id)
        var payload = req.body;
        //console.log(payload.Email)
        updateJobAcceptedEmployeeByEmail(client, id, payload.Email, res)
    })

    app.delete('/job/CurrentEmployee/:id', (req, res) => {
        // res.header('Access-Control-Allow-Origin', "*");
        var id = parseInt(req.params.id);
        console.log(id)
        var payload = req.body;
        //console.log(payload.Email)
        deleteCurrentEmployeeByID(client, id, payload.Email, res)
    })
    // app.put('/user/:id', (req, res) => {
    //    var id = parseInt(req.params.id)
    //     var payload = req.body
    //     updateUserByID(client, id, payload, res)
    // })
/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////CASH
    app.post('/wallet/job/:id', (req, res) => {
        // res.header('Access-Control-Allow-Origin', "*");
        var id = parseInt(req.params.id);
       success =  cash.makeTransaction(client, id, res)
    })




    app.listen(9000, () => {
        console.log('Application is running on port 9000')
    })    
    
    
    
    
    ///////////getJobDetailByDrive/////
    
    app.get('/getalljob', (req, res) => { //get all list of db
        //console.log(findUserByID(client, id))
        res.header('Access-Control-Allow-Origin', "*");
        findAllJob(client, res);
       // res.json(`OK`)

    })
    
}
main().catch(console.error)

    
    


