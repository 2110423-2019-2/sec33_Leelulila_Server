const express = require('express');
const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');


const cash = require('./cash.js');
const notify = require('./notify.js');
const suggest = require('./suggestion.js');
const blog = require('./blog.js');
const review = require('./review.js');
const authController = require('./authController');
const users = require('./users.js')
const jobs = require('./jobs.js')
// var cors = require('cors');

dotenv.config({
  path: './config.env',
});

// app.use(cors);
const app = express();

app.use(express.json());
app.use(cookieParser());

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



    


// module.exports = createJob;

/////////////////////////////////////////////////////////////////////////////////////////

//READ
/////////////////////////////////////////////////////////////////////////////////////////





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

    //await client.db('CUPartTime').collection('Users').updateMany({},{$set : { pendingJob : []}})
   // await client.db('CUPartTime').collection('Users').updateMany({},{$set : { currentJob : []}})
   // await client.db('CUPartTime').collection('Users').updateMany({},{$set : { jobOwn : []}})
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
    users.createUser(client, payload, res);
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
    const id = parseInt(req.params.id);
    users.findUserByID(client, id, res);
  });
  app.get('/useremail/:email', authController.protect ,(req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    var email = req.params.email;
    users.findUserByEmail(client, email, res);
  });
  app.put('/user/:id', authController.protect, (req, res) => {
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    const id = parseInt(req.params.id);
    users.updateUserByID(client, id, payload, res);
  });
  /////////////////////////////////////////////////////////////////////////////////////////

  //JOB
  /////////////////////////////////////////////////////////////////////////////////////////
  app.get('/job/:id', (req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    var id = parseInt(req.params.id);

    jobs.findJobByID(client, id, res);
  });
  app.post('/newjob', (req, res) => {
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    jobs.createJob(client, payload, res);
    res.json(payload); //ใครส่งซ้ำมันบัคๆนะ
  });
  app.delete('/job/:id', (req, res) => {
    var id = parseInt(req.params.id);

    jobs.deleteJobByID(client, id, res);
  });
  app.put('/jobUpdate/:id', (req, res) => {
    var id = parseInt(req.params.id);
    var encryptedData = req.body.data;
    var bytes = CryptoJS.AES.decrypt(encryptedData, '123456');
    var payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    console.log(payload);
    jobs.editJob(client, payload, id, res);
  });
  app.put('/jobstatus/:id', (req, res) => {
    var id = parseInt(req.params.id);
    let payload = req.body;
    if (process.env.NODE_ENV === 'production') {
      payload = decryptData(payload.data);
    }
    console.log(payload);
    jobs.updateJobStatusByID(client, id, payload.Status, res);
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
    jobs.updateJobEmployeeByEmail(client, id, payload.Email, res);
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
    jobs.updateJobAcceptedEmployeeByEmail(client, id, payload.Email, res);
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
    jobs.deleteCurrentEmployeeByID(client, id, payload.Email, res);
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
    jobs.updateJobStatusByID(client, id, 'Finish', res);
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
  app.listen(9000, () => {
    console.log('Application is running on port 9000');
  });

  ///////////getJobDetailByDrive/////

  app.get('/getalljob', (req, res) => {
    //get all list of db
    res.header('Access-Control-Allow-Origin', '*');
    jobs.findAllJob(client, res);
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
