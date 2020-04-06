exports.jobNotify = (async (mongo, jobId, email, type) => {
  try {
    const currentJob = await mongo.db('CUPartTime').collection('Job').findOne({
      _id: jobId,
    });
    const jobName = currentJob.job.JobName;
    let payload = {};
    if (type == 0) {
      var string = 'Your job ' + jobName + ' has a new applicant';
      payload = {
        timestamp: Date.now(),
        string: string,
        status: 0,
      };
    } else if (type == 1) {
      const string =
        'Sadly, your application for ' +
        jobName +
        ' has been refused, good luck next time!';
      payload = {
        timestamp: Date.now(),
        string: string,
        status: 0,
      };
    } else if (type == 2) {
      const string =
        'Congratulations you has been accepted to ' + jobName + ' job';
      payload = {
        timestamp: Date.now(),
        string: string,
        status: 0,
      };
    } else {
      console.log('error unknown type');
      // return new AppError('Unknown type', 400);
    }
    const result = await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateMany({
        email,
      }, {
        $push: {
          notification: payload,
        },
      });
    if (result) {
      console.log('Successfully notify to', email);
    } else {
      console.log('fail to notify');
    }
  } catch (err) {
    throw new Error(err.message);
  }

});

exports.notifyIncomingJob = (async (mongo) => {
  try {
    const allJobs = await mongo.db('CUPartTime').collection('Job').find({});
    //console.log(find)
    allJobs.forEach(async function (jobs) {
      if (jobs.job.BeginTime) {
        if (jobs.job.CurrentAcceptedEmployee.length > 0) {
          const beginTime = jobs.job.BeginTime;

          const year = jobs.job.Date.substring(0, 4);
          const month = jobs.job.Date.substring(5, 7);
          const day = jobs.job.Date.substring(8, 10);

          const date = year + '-' + month + '-' + day;
          const time = 'T' + beginTime + ':00';
          const jobTime = Date.parse(date + time);
          const now = Date.now();
          console.log(jobTime - now, date, time, jobs._id);
          if (jobTime - now > 0) {
            let msg = '';
            const length = jobTime - now;
            if (length < 259200000 && length > 86400000) {
              const emails = jobs.notify1;
              if (length > 86400000 * 2) {
                count = 3;
              } else {
                count = 2;
              }
              msg =
                'Your work at ' +
                jobs.job.JobName +
                ' starts in ' +
                count +
                ' days';
              const payload = {
                timestamp: Date.now(),
                string: msg,
                status: 0,
              };
              const result = await mongo
                .db('CUPartTime')
                .collection('Users')
                .updateMany({
                  email: {
                    $in: emails,
                  },
                }, {
                  $push: {
                    notification: payload,
                  },
                });
              if (result.modifiedCount > 0) {
                console.log('notified', msg);
              }
              await mongo
                .db('CUPartTime')
                .collection('Job')
                .updateOne({
                  _id: jobs._id,
                }, {
                  $pull: {
                    notify1: {
                      $in: emails,
                    },
                  },
                });
              await mongo
                .db('CUPartTime')
                .collection('Job')
                .updateOne({
                  _id: jobs._id,
                }, {
                  $push: {
                    notify2: {
                      $each: emails,
                    },
                  },
                });
            } else if (length < 86400000 && length > 43200000) {
              let nmails = [];
              if (jobs.notify1.length > 0) {
                nmails = jobs.notify1;
                await mongo
                  .db('CUPartTime')
                  .collection('Job')
                  .updateOne({
                    _id: jobs._id,
                  }, {
                    $pull: {
                      notify1: {
                        $in: nmails,
                      },
                    },
                  });
                await mongo
                  .db('CUPartTime')
                  .collection('Job')
                  .updateOne({
                    _id: jobs._id,
                  }, {
                    $push: {
                      notify2: {
                        $each: nmails,
                      },
                    },
                  });
              }
              const emails = jobs.notify2.concat(nmails);
              msg = 'Your work at ' + jobs.job.JobName + ' starts in 1 day';
              const payload = {
                timestamp: Date.now(),
                string: msg,
                status: 0,
              };
              const result = await mongo
                .db('CUPartTime')
                .collection('Users')
                .updateMany({
                  email: {
                    $in: emails,
                  },
                }, {
                  $push: {
                    notification: payload,
                  },
                });
              if (result.modifiedCount > 0) {
                console.log('notified', msg);
              }
              await mongo
                .db('CUPartTime')
                .collection('Job')
                .updateOne({
                  _id: jobs._id,
                }, {
                  $pull: {
                    notify2: {
                      $in: emails,
                    },
                  },
                });
              await mongo
                .db('CUPartTime')
                .collection('Job')
                .updateOne({
                  _id: jobs._id,
                }, {
                  $push: {
                    notify3: {
                      $each: emails,
                    },
                  },
                });
            } else if (length < 43200000) {
              let nmails1 = [];
              let nmails2 = [];
              if (jobs.notify1.length > 0) {
                nmails1 = jobs.notify1;
                await mongo
                  .db('CUPartTime')
                  .collection('Job')
                  .updateOne({
                    _id: jobs._id,
                  }, {
                    $pull: {
                      notify1: {
                        $in: nmails1,
                      },
                    },
                  });
                await mongo
                  .db('CUPartTime')
                  .collection('Job')
                  .updateOne({
                    _id: jobs._id,
                  }, {
                    $push: {
                      notify3: {
                        $each: nmails1,
                      },
                    },
                  });
                console.log('eiei');
              }
              if (jobs.notify2.length > 0) {
                nmails2 = jobs.notify2;
                await mongo
                  .db('CUPartTime')
                  .collection('Job')
                  .updateOne({
                    _id: jobs._id,
                  }, {
                    $pull: {
                      notify2: {
                        $in: nmails2,
                      },
                    },
                  });
                await mongo
                  .db('CUPartTime')
                  .collection('Job')
                  .updateOne({
                    _id: jobs._id,
                  }, {
                    $push: {
                      notify3: {
                        $each: nmails2,
                      },
                    },
                  });
              }
              let emails = jobs.notify3.concat(nmails1);
              emails = emails.concat(nmails2);
              msg = 'Your work at ' + jobs.job.JobName + ' starts in 12 hours';
              const payload = {
                timestamp: Date.now(),
                string: msg,
                status: 0,
              };
              console.log(emails, jobs._id);
              await mongo
                .db('CUPartTime')
                .collection('Job')
                .updateOne({
                  _id: jobs._id,
                }, {
                  $pull: {
                    notify3: {
                      $in: emails,
                    },
                  },
                });
              const result3 = await mongo
                .db('CUPartTime')
                .collection('Users')
                .updateMany({
                  email: {
                    $in: emails,
                  },
                }, {
                  $push: {
                    notification: payload,
                  },
                });

              if (result3.modifiedCount > 0) {
                console.log('successfully notify 12 hours');
              }
            }
          } else {
            //late for work ?
            if (jobs.notify1.length > 0) {
              const nmails = jobs.notify1;
              await mongo
                .db('CUPartTime')
                .collection('Job')
                .updateOne({
                  _id: jobs._id,
                }, {
                  $pull: {
                    notify1: {
                      $in: nmails,
                    },
                  },
                });
              await mongo
                .db('CUPartTime')
                .collection('Job')
                .updateOne({
                  _id: jobs._id,
                }, {
                  $push: {
                    notify3: {
                      $each: nmails,
                    },
                  },
                });
            }
            if (jobs.notify2.length > 0) {
              const nmails = jobs.notify2;
              await mongo
                .db('CUPartTime')
                .collection('Job')
                .updateOne({
                  _id: jobs._id,
                }, {
                  $pull: {
                    notify2: {
                      $in: nmails,
                    },
                  },
                });
              await mongo
                .db('CUPartTime')
                .collection('Job')
                .updateOne({
                  _id: jobs._id,
                }, {
                  $push: {
                    notify3: {
                      $each: nmails,
                    },
                  },
                });
            }
          }
        }
      } else {
        // return new AppError('job corrupted', 400);
        console.log('job corrupted');
      }
    });

  } catch (err) {
    throw new Error(err.message);
  }
});

exports.notifyMany = (async (mongo, email, msg) => {
  try {
    const payload = {
      timestamp: Date.now(),
      string: msg,
      status: 0,
    };
    const result = await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateMany({
        email: {
          $in: email,
        },
      }, {
        $push: {
          notification: payload,
        },
      });
    if (result) {
      console.log('notified the users', result.modifiedCount);
    } else {
      console.log('fail to notify the user');
    }
  } catch (err) {
    throw new Error(err.message);
  }
});

exports.notifyPayload = (async (mongo, email, payload) => {
  try {
    const result = await mongo
      .db('CUPartTime')
      .collection('Users')
      .updateMany({
        email: {
          $in: email,
        },
      }, {
        $push: {
          notification: payload,
        },
      });
    if (result) {
      console.log('notified the users', result.modifiedCount, payload.string);
    } else {
      console.log('fail to notify the user');
    }
  } catch (err) {
    throw new Error(err.message);
  }
});