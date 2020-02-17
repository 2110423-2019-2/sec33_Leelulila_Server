

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
    
    const result = await client.db("CUPartTime").collection("Users").insertOne(newUser);
    console.log(`New User created with the following id: ${result.insertedId}`);
    res.json(`New User created with the following id: ${result.insertedId}`);
    }catch(e){
        console.error(e)
    }
}

async function createMultipleUser(client, newUsers){
    const result = await client.db("CUPartTime").collection("Users").insertMany(newUsers);
    console.log(`${result.insertedCount} new User(s) created with the following id(s):`);
    console.log(result.insertedIds);
}


async function createJob(client, newJob,res){
    try{
    const sequenceName = "jobid"
    const id = await client.db("CUPartTime").collection("counters").findOne({ _id : sequenceName });
    await client.db("CUPartTime").collection("counters").updateOne({ _id : sequenceName }, { $inc: {sequence_value : 1 }});
    // newJob._id = id.sequence_value
    
    var jobNo = "J" + id.sequence_value;
    newJob._id = id.sequence_value; 
    const result = await client.db("CUPartTime").collection("Job").insertOne({[jobNo]:newJob});
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
    result = await client.db("CUPartTime").collection("Job").find({}).toArray();
         
    if (result) {
        res.json(result);
    } 
    else {
        console.log(`No user found with the nam`);                   
    }


}   
async function findJByID(client, id,res){

    var jID = "J"+id
    try{
        cursor = await client.db("CUPartTime").collection("Job").find({}, {_id : 1})
        result = await cursor.toArray
        if (result) {
            res.json(result);
            console.log(jID)
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
/////////////////////////////////////////////////////////////////////////////////////////

//DELETE
/////////////////////////////////////////////////////////////////////////////////////////

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

        //await createUser(client,{name: "uouoeiei"});
       // await updateUserByName(client, "Somnuk", {name : "Drive"});
       // await findUserByName(client, "Somnuk");
        
    }
    catch (e) {
        console.error(e);
    }
//USER
/////////////////////////////////////////////////////////////////////////////////////////
    app.get('/user/:id', (req, res) => { //get all list of db
        var id = parseInt(req.params.id)
        findUserByID(client, id, res)
    })
    app.get('/useremail/:email', (req, res) => { //get all list of db
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
        var id = parseInt(req.params.id)
        
        findJByID(client, id, res)
    })
    app.post('/newjob', (req, res) => {
        var payload = req.body;
        console.log(payload)
        createJob(client, payload, res)
        //res.json(payload)
    })
    // app.put('/user/:id', (req, res) => {
    //    var id = parseInt(req.params.id)
    //     var payload = req.body
    //     updateUserByID(client, id, payload, res)
    // })
/////////////////////////////////////////////////////////////////////////////////////////

    app.listen(9000, () => {
        console.log('Application is running on port 9000')
    })    
    
    
    
    
    ///////////getJobDetailByDrive/////
    
    app.get('/getalljob', (req, res) => { //get all list of db
        //console.log(findUserByID(client, id))
        res.header('Access-Control-Allow-Origin', "*");
        findAllJob(client, res);

    })
    
}
main().catch(console.error)

    
    


