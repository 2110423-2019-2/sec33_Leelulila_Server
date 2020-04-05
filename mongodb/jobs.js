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

async function findAllJob(client, res) {
  try {
    result = await client.db('CUPartTime').collection('Job').find({}).toArray();
    //console.log('ee')
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