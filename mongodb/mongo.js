const express = require('express');
const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const calendar = require('./calendar.js');
const cash = require('./cash.js');
const notify = require('./notify.js');
const suggest = require('./suggestion.js');
const blog = require('./blog.js');
const review = require('./review.js');
const authController = require('./authController');
<<<<<<< HEAD
var cors = require('cors');
||||||| merged common ancestors
// var cors = require('cors');
=======
>>>>>>> 0d201b50104eea93fce4a99aa16ba807ec9f4cb8

dotenv.config({
  path: './config.env',
});


const app = express();
app.use(cors);
app.use(express.json());
app.use(cookieParser());

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// Test cookies middleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(req.cookies);
//   next();
// });

// async function listDatabases(client) {
//     databasesList = await client
//         .db()
//         .admin()
//         .listDatabases();

//     console.log('Databases:');
//     databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// }
// async function getNextSequenceValue(client, sequenceName) {
//     result = await client
//         .db('CUPartTime')
//         .collection('counters')
//         .findOne({
//             _id: sequenceName
//         });
//     await client
//         .db('CUPartTime')
//         .collection('counters')
//         .updateOne({
//             _id: sequenceName
//         }, {
//             $inc: {
//                 sequence_value: 1
//             }
//         });
//     console.log(result.sequence_value);

//     return result.sequence_value;
// }

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, '123456');
  const payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return payload;
};

//CREATE
/////////////////////////////////////////////////////////////////////////////////////////
async function createUser(client, newUser, res) {
  try {
    const sequenceName = 'productid';
    const id = await client.db('CUPartTime').collection('counters').findOne({
      _id: sequenceName,
    });
    await client
      .db('CUPartTime')
      .collection('counters')
      .updateOne(
        {
          _id: sequenceName,
        },
        {
          $inc: {
            sequence_value: 1,
          },
        }
      );

    newUser._id = id.sequence_value;
    newUser.currentJob = [];
    newUser.pendingJob = [];
    newUser.notification = [];
    newUser.TFvector = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    newUser.wallet = 0;
    newUser.jobOwn = [];
    newUser.blogOwn = [];
    newUser.reviewOwn = [];

    // console.log(newUser);

    let result = await client
      .db('CUPartTime')
      .collection('Users')
      .insertOne(newUser);
    calendar.createCalendar(client, newUser.Email);
    // console.log(result.ops[0]);
    // result:
    // ops: [
    //   {
    //     email: 'test01@example.com',
    //     password: 'test1234',
    //     _id: 124,
    //     currentJob: [],
    //     pendingJob: [],
    //     notification: [],
    //     TFvector: [Array],
    //     wallet: 0,
    //     jobOwn: [],
    //     blogOwn: [],
    //     reviewOwn: [],
    //   },
    // ];
    authController.createSendToken(result.ops[0], 201, res);
    // console.log(`New User created with the following id: ${result.insertedId}`);
    res.json(`New User created success`); //with the following id: ${result.insertedId}`);
  } catch (e) {
    console.error(e);
  }
}

async function userLogin(client, user, res) {
  try {
    const { email, pass } = user;

    // 1) Check if email and password exist
    if (!email || !pass) {
      throw new Error('Please provide email and password');
    }

    // 2) Check if user exists && password is correct
    const currentUser = await client
      .db('CUPartTime')
      .collection('Users')
      .findOne({
        email
      });

    //   await bcrypt.compare(candidatePassword, userPassword);
    if (!currentUser || !(currentUser.password === pass)) {
      res.status(404).json({ 
        status: 'fail', 
        message: 'Incorrect email or password'
      })
      throw new Error('Incorrect email or password');
    }

    authController.createSendToken(currentUser, 200, res);
  } catch (e) {
    console.log(e);
  }
}
    

async function createJob(client, newJob, res) {
  try {
    const sequenceName = 'jobid';
    const id = await client.db('CUPartTime').collection('counters').findOne({
      _id: sequenceName,
    });
    await client
      .db('CUPartTime')
      .collection('counters')
      .updateOne(
        {
          _id: sequenceName,
        },
        {
          $inc: {
            sequence_value: 1,
          },
        }
      );
    // newJob._id = id.sequence_value
    const result = await client.db('CUPartTime').collection('Job').insertOne({
      _id: id.sequence_value,
      job: newJob,
      notify1: [],
      notify2: [],
      notify3: [],
    });
    await client
      .db('CUPartTime')
      .collection('Users')
      .updateOne(
        {
          email: newJob.Employer,
        },
        {
          $push: {
            jobOwn: id.sequence_value,
          },
        }
      );

    const out = `New Job created with the following id: `; //${result.insertedId}`);
    console.log(`${out} ${result.insertedId}`);
    res.json(out); // ${result.insertedId}`)
  } catch (e) {
    console.error(e);
    //res.json(e);
  }
}
// module.exports = createJob;

/////////////////////////////////////////////////////////////////////////////////////////

//READ
/////////////////////////////////////////////////////////////////////////////////////////
async function findUserByID(client, id, res) {
  result = await client.db('CUPartTime').collection('Users').findOne({
    _id: id,
  });

  if (result) {
    console.log(`Found user(s) with the name '${id}':`);
    //console.log(result);
    res.json(result);
  } else {
    console.log(`No user found with the name '${id}'`);
  }
  return result;
}

async function findUserByEmail(client, email, res) {
  result = await client.db('CUPartTime').collection('Users').findOne({
    email: email,
  });
  //console.log(result);
  if (result) {
    //console.log(`Found user(s) with the name '${email}':`);
    //console.log(result);
    res.json(result);
  } else {
    console.log(`No user found with the name '${email}'`);
  }
  return result;
}

async function findAllJob(client, res) {
  try {
    result = await client.db('CUPartTime').collection('Job').find({}).toArray();

    if (result) {
      res.json(result);
      //console.log(result)
    } else {
      console.log(`cannot find all job`);
    }
  } catch (e) {
    console.error(e);
  }
}
async function findJobByID(client, id, res) {
  try {
    result = await client.db('CUPartTime').collection('Job').findOne({
      _id: id,
    });

    if (result) {
      res.json(result);
      // res.json({
      //   code: 200,
      //   message: 'success'
      // })
    } else {
      console.log('No user found with the nam', id);
    }
  } catch (e) {
    console.error(e);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////

//UPDATEl
/////////////////////////////////////////////////////////////////////////////////////////
async function updateUserByID(client, id, updatedName, res) {
  try {
    result = await client.db('CUPartTime').collection('Users').updateOne(
      {
        _id: id,
      },
      {
        $set: updatedName,
      }
    );

    console.log(
      `${result.matchedCount} document(s) matched the query criteria.`
    );
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
    //res.json(`${result.modifiedCount} document(s) was/were updated.`);
    res.json(`${result.matchedCount} document(s) matched the query criteria.`);
  } catch (e) {
    console.error(e);
  }
}
async function updateJobStatusByID(client, id, status, res) {
  try {
    const find = await client.db('CUPartTime').collection('Job').findOne({
      _id: id,
    });
    if (find) {
      find.job.Status = status;
      if (status == 'Confirm') {
        pendingList = find.job.CurrentEmployee;
        pending = await client
          .db('CUPartTime')
          .collection('Users')
          .updateMany(
            {
              email: {
                $in: pendingList,
              },
            },
            {
              $pull: {
                pendingJob: id,
              },
            }
          );
        find.job.CurrentEmployee = [];
      } else if (status == 'Finish') {
        acceptedList = find.job.CurrentAcceptedEmployee;
        await client
          .db('CUPartTime')
          .collection('Users')
          .updateMany(
            {
              email: {
                $in: acceptedList,
              },
            },
            {
              $pull: {
                currentJob: id,
              },
            }
          );
        find.job.CurrentAcceptedEmployee = [];
      }
      result = await client.db('CUPartTime').collection('Job').updateOne(
        {
          _id: id,
        },
        {
          $set: find,
        }
      );

      console.log(
        `${result.matchedCount} document(s) matched the query criteria.`
      );
      console.log(`${result.modifiedCount} document(s) was/were updated.`);
      //res.json(`${result.modifiedCount} document(s) was/were updated.`);
      //res.json()
    } else {
      res.json(`cannot find job`);
      console.log('cannot find job');
    }
    res.json(`${result.matchedCount} document(s) matched the query criteria.`);
  } catch (e) {
    console.error(e);
  }
}
async function editJob(client, payload, id, res) {
  try {
    find = await client.db('CUPartTime').collection('Job').findOne({
      _id: id,
    });
    if (find) {
      if (
        payload.JobDetail &&
        payload.Wages &&
        payload.Location &&
        payload.BeginTime &&
        payload.Date &&
        payload.EndTime
      ) {
        find.job.JobDetail = payload.JobDetail;
        find.job.Wages = payload.Wages;
        find.job.Location = payload.Location;
        find.job.BeginTime = payload.BeginTime;
        find.job.Date = payload.Date;
        find.job.EndTime = payload.EndTime;
        //console.log(find.job)
        result = await client.db('CUPartTime').collection('Job').updateOne(
          {
            _id: id,
          },
          {
            $set: find,
          }
        );
        if (result) {
          res.json(`ok`);
        } else {
          res.json(`fail`);
        }
      } else {
        res.json(`fail not enough data`);
      }
    } else {
      res.json(`fail no job with the id ${id}`);
    }
  } catch (e) {
    console.log(e);
  }
}
async function updateJobEmployeeByEmail(client, id, email, res) {
  //
  try {
    const find = await client.db('CUPartTime').collection('Job').findOne({
      _id: id,
    });
    if (find) {
      //console.log(email)

      insert = await client
        .db('CUPartTime')
        .collection('Users')
        .updateOne(
          {
            email: email,
          },
          {
            $push: {
              pendingJob: id,
            },
          }
        );
      suggest.addTFvector(client, email, find.job.TFvector);
      console.log(insert.modifiedCount);
      if (insert.matchedCount == 0) {
        res.json(`No user with the email ${email}`);
        return;
      }
      find.job.CurrentEmployee.push(email);
      result = await client.db('CUPartTime').collection('Job').updateOne(
        {
          _id: id,
        },
        {
          $set: find,
        }
      );
      notify.jobNotify(client, find.job.Employer, id, 0);
      console.log(
        `${result.matchedCount} document(s) matched the query criteria.`
      );
      console.log(`${result.modifiedCount} document(s) was/were updated.`);
      //res.json(`${result.modifiedCount} document(s) was/were updated.`);
      //res.json()
      res.json(
        `${result.matchedCount} document(s) matched the query criteria.`
      );
    } else {
      console.log('cannot find');
      res.json(`No document(s) matched the query criteria.`);
    }
  } catch (e) {
    console.error(e);
  }
}

async function updateJobAcceptedEmployeeByEmail(client, id, email, res) {
  try {
    console.log(id, email);
    const find = await client.db('CUPartTime').collection('Job').findOne({
      _id: id,
    });
    if (find) {
      amt = parseInt(find.job.Amount);
      if (find.job.CurrentAcceptedEmployee.length + 1 > amt) {
        console.log('reach maximum employee');
        res.json(`reach max employee`);
        return;
      }
      //remove the job from pending list also validate the email
      remove = await client
        .db('CUPartTime')
        .collection('Users')
        .updateOne(
          {
            email: email,
          },
          {
            $pull: {
              pendingJob: id,
            },
          }
        );
      if (remove.matchedCount == 0) {
        res.json(`No user with the email ${email}`);
        return;
      }
      //the email is valid
      await client
        .db('CUPartTime')
        .collection('Users')
        .updateOne(
          {
            email: email,
          },
          {
            $push: {
              currentJob: id,
            },
          }
        );
      const idx = find.job.CurrentEmployee.indexOf(email);
      console.log(email);
      if (idx > -1) {
        find.job.CurrentEmployee.splice(idx, 1);
      }
      //push to job after everything is confirmed
      find.job.CurrentAcceptedEmployee.push(email);
      console.log(find.job.CurrentAcceptedEmployee);
      result = await client.db('CUPartTime').collection('Job').updateOne(
        {
          _id: id,
        },
        {
          $set: find,
        }
      );
      await client
        .db('CUPartTime')
        .collection('Job')
        .updateOne(
          {
            _id: id,
          },
          {
            $push: {
              notify1: email,
            },
          }
        );
      notify.jobNotify(client, email, id, 2);
      console.log(
        `${result.matchedCount} document(s) matched the query criteria.`
      );
      console.log(`${result.modifiedCount} document(s) was/were updated.`);
      //res.json(`${result.modifiedCount} document(s) was/were updated.`);
      //res.json()
      res.json(
        `${result.matchedCount} document(s) matched the query criteria.`
      );
    } else {
      console.log('cannot find the job by id:', id);
      res.json(`No document(s) matched the query criteria.`);
    }
  } catch (e) {
    console.error(e);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////

//DELETE
/////////////////////////////////////////////////////////////////////////////////////////
async function deleteJobByID(client, id, res) {
  try {
    find = await client.db('CUPartTime').collection('Job').findOne({
      _id: id,
    });
    if (find == null) {
      console.log(`No Job with the ID '${id}':`);
      res.send('fail');
    }
    employer = find.job.Employer;
    pendingList = find.job.CurrentEmployee;
    acceptedList = find.job.CurrentAcceptedEmployee;
    result = await client.db('CUPartTime').collection('Job').deleteOne({
      _id: id,
    });
    if (result) {
      console.log(`Deleted Job with the ID '${id}':`);
      pending = await client
        .db('CUPartTime')
        .collection('Users')
        .updateMany(
          {
            email: {
              $in: pendingList,
            },
          },
          {
            $pull: {
              pendingJob: id,
            },
          }
        );
      accepted = await client
        .db('CUPartTime')
        .collection('Users')
        .updateMany(
          {
            email: {
              $in: acceptedList,
            },
          },
          {
            $pull: {
              currentJob: id,
            },
          }
        );
      await client
        .db('CUPartTime')
        .collection('Users')
        .updateOne(
          {
            email: employer,
          },
          {
            $pull: {
              jobOwn: id,
            },
          }
        );
      notify.notifyMany(
        client,
        pendingList,
        find.job.JobName + ' which you applied has been deleted'
      );
      notify.notifyMany(
        client,
        acceptedList,
        find.job.JobName + ' has been deleted'
      );
      console.log(pending.modifiedCount);
      console.log(accepted.modifiedCount);
      res.send('success');
    } else {
      console.log(`No Job with the ID '${id}':`);
      res.send('fail');
    }
  } catch (e) {
    console.error(e);
  }
}
async function deleteCurrentEmployeeByID(client, jobID, email, res) {
  try {
    find = await client.db('CUPartTime').collection('Job').findOne({
      _id: jobID,
    });
    //console.log(find.CurrentEmployee)
    if (find.job.CurrentEmployee != null) {
      const idx = find.job.CurrentEmployee.indexOf(email);
      console.log(idx);
      if (idx > -1) {
        find.job.CurrentEmployee.splice(idx, 1);
      } else {
        res.json(`This job has no Email ${email}`);
        return;
      }
      result = await client.db('CUPartTime').collection('Job').updateOne(
        {
          _id: jobID,
        },
        {
          $set: find,
        }
      );
      notify.jobNotify(client, email, jobID, 1);
      res.json(`Successfull`);
      console.log('Successfull');
    } else {
      res.json(`cannot find the job by id`);
      console.log('cannot find job by', jobID);
    }
  } catch (e) {
    console.error(e);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////
async function main() {
  const MongoClient = require('mongodb').MongoClient;
  const uri =
    'mongodb+srv://admin:cuparttime2020@cluster0-rjut3.mongodb.net/test?retryWrites=true&w=majority';
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    //connect to db eiei
    await client.connect();
    //suggest.createTFvector(client)
    // suggest.addTFvector(client,"drive@hotmail.com",[1,0,0,1,0,1,0,1,0,0])
    //notify.jobNotify(client, "drive@hotmail.com", 125, 0)
    //await client.db("CUPartTime").collection("Users").createIndex({email : 1},{unique : true});
    // await listDatabases(client);
    // await client.db("CUPartTime").collection("Users").updateMany({}, {$set :{reviewOwn:[]}})

    // await client.db("CUPartTime").collection("Job").updateMany({}, {$set :{notify2:[]}})
    //await client.db("CUPartTime").collection("Job").updateMany({}, {$set :{notify3:[]}})
    //await createUser(client,{name: "uouoeiei"});
    // await updateUserByName(client, "Somnuk", {name : "Drive"});
    // await findUserByName(client, "Somnuk");
  } catch (e) {
    console.error(e);
  }
  //USER
  /////////////////////////////////////////////////////////////////////////////////////////
  app.post('/newuser', (req, res) => {
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    createUser(client, payload, res);
  });

  app.post('/userlogin', (req, res) => {
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    userLogin(client, payload, res);
  });
  
  app.get('/userlogout', (req, res) => {
    authController.logout(req, res);
  })

  app.get('/user/:id', authController.protect, (req, res) => {
    //get all list of db
    console.log('fromgetuserid', req.cookies);
    const id = parseInt(req.params.id);
    findUserByID(client, id, res);
  });
  app.get('/useremail/:email', authController.protect ,(req, res) => {
    //get all list of db
    console.log('fromgetuseremail', req.cookies);
    res.header('Access-Control-Allow-Origin', '*');
    var email = req.params.email;
    findUserByEmail(client, email, res);
  });
  app.put('/user/:id', authController.protect, (req, res) => {
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    const id = parseInt(req.params.id);
    updateUserByID(client, id, payload, res);
  });
  /////////////////////////////////////////////////////////////////////////////////////////

  //JOB
  /////////////////////////////////////////////////////////////////////////////////////////
  app.get('/job/:id', (req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);

    findJobByID(client, id, res);
  });
  app.post('/newjob', (req, res) => {
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    createJob(client, payload, res);
    res.json(payload); //ใครส่งซ้ำมันบัคๆนะ
  });
  app.delete('/job/:id', (req, res) => {
    var id = parseInt(req.params.id);

    deleteJobByID(client, id, res);
  });
  app.put('/jobUpdate/:id', (req, res) => {
    var id = parseInt(req.params.id);
    var encryptedData = req.body.data;
    var bytes = CryptoJS.AES.decrypt(encryptedData, '123456');
    var payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    console.log(payload);
    editJob(client, payload, id, res);
  });
  app.put('/jobstatus/:id', (req, res) => {
    var id = parseInt(req.params.id);
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    console.log(payload);
    updateJobStatusByID(client, id, payload.Status, res);
  });

  app.put('/job/addemployee/:id', (req, res) => {
    // res.header('Access-Control-Allow-Origin', "*");
    var id = parseInt(req.params.id);
    console.log('receive success');
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    console.log(payload.Email);
    updateJobEmployeeByEmail(client, id, payload.Email, res);
  });

  app.put('/job/addacceptedemployee/:id', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);
    console.log(id);
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    //console.log(payload.Email)
    updateJobAcceptedEmployeeByEmail(client, id, payload.Email, res);
  });

  app.delete('/job/CurrentEmployee/:id', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);
    console.log(id);
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    //console.log(payload.Email)
    deleteCurrentEmployeeByID(client, id, payload.Email, res);
  });
  // app.put('/user/:id', (req, res) => {
  //    var id = parseInt(req.params.id)
  //     var payload = req.body
  //     updateUserByID(client, id, payload, res)
  // })
  /////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////CASH
  app.post('/wallet/job/:id', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);
    success = cash.makeTransaction(client, id, res);
    updateJobStatusByID(client, id, 'Finish', res);
  });

  app.put('/read', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    notify.readNotify(client, payload.Email, res);
  });
  /////////Blog
  app.post('/newblog', (req, res) => {
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    blog.createBlog(client, payload, res);
  });
  app.get('/blog/:id', (req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);

    blog.getBlog(client, id, res);
  });
  app.get('/allblog', (req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);

    blog.getAllBlog(client, res);
  });
  app.delete('/blog/:id', (req, res) => {
    var id = parseInt(req.params.id);

    blog.deleteBlog(client, id, res);
  });
  app.put('/blogUpdate/:id', (req, res) => {
    var id = parseInt(req.params.id);
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    blog.editBlog(client, id, payload, res);
  });
  app.post('/blog/newcomment/:id', (req, res) => {
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    const id = parseInt(req.params.id);
    blog.comment(client, id, payload, res);
  });
  app.put('/blog/comment/:id', (req, res) => {
    var id = parseInt(req.params.id);
    var payload = req.body;
    var cid = payload.cid;
    delete payload.cid;
    blog.editComment(client, id, payload, cid, res);
  });
  app.get('/blog/allcomment/:id', (req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);

    blog.getAllComment(client, id, res);
  });
  app.get('/blog/comment/:id', (req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);
    var payload = req.body;
    var cid = payload.cid;
    delete payload.cid;
    blog.getCommentByCid(client, id, cid, res);
  });
  app.delete('/blog/comment/:id', (req, res) => {
    var id = parseInt(req.params.id);
    var payload = req.body;
    var cid = payload.cid;
    delete payload.cid;
    blog.deleteComment(client, id, cid, res);
  });

  /////////Review
  app.post('/newreview', (req, res) => {
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    review.createReview(client, payload, res);
  });
  app.get('/review/:id', (req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);

    review.getReview(client, id, res);
  });
  app.get('/allreview', (req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);

    review.getAllReview(client, res);
  });
  app.delete('/review/:id', (req, res) => {
    var id = parseInt(req.params.id);

    review.deleteReview(client, id, res);
  });
  app.put('/reviewUpdate/:id', (req, res) => {
    var id = parseInt(req.params.id);
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    review.editReview(client, id, payload, res);
  });
  // app.put('/notifyincoming', (req, res) => {
  //  console.log('eiei')
  //  notify.notifyIncomingJob(client)
  // })
  app.listen(9000 ,'cupt_backend',() => {
    console.log('Application is running on port 9000');
  });

  ///////////getJobDetailByDrive/////

  app.get('/getalljob', authController.protect, (req, res) => {
    //get all list of db
    // console.log(req.headers);
    // console.log('fromgetalljob', req.headers.authorization);

    res.header('Access-Control-Allow-Origin', '*');
    findAllJob(client, res);
    // res.json(`OK`)
  });

  // process.on('unhandledRejection', err => {
  //   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  //   console.log(err.name, err.message);
  //   server.close(() => {
  //     process.exit(1);
  //   });
  // });
}
main().catch(console.error);
