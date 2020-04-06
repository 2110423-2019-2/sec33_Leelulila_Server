exports.updateJobStatus = (async (mongo, _id, currentStatus, res) => {
    try {
        // const _id = parseInt(req.params.id);
        // const currentStatus = req.body;
        const currentJob = await mongo.db('CUPartTime').collection('Job').findOne({
            _id,
        });
        if (currentJob) {
            currentJob.job.Status = currentStatus;
            if (currentStatus == 'Confirm') {
                pendingList = currentJob.job.CurrentEmployee;
                pending = await mongo
                    .db('CUPartTime')
                    .collection('Users')
                    .updateMany({
                        email: {
                            $in: pendingList,
                        },
                    }, {
                        $pull: {
                            pendingJob: _id,
                        },
                    });
                currentJob.job.CurrentEmployee = [];
            } else if (currentStatus == 'Finish') {
                acceptedList = currentJob.job.CurrentAcceptedEmployee;
                await mongo
                    .db('CUPartTime')
                    .collection('Users')
                    .updateMany({
                        email: {
                            $in: acceptedList,
                        },
                    }, {
                        $pull: {
                            currentJob: _id,
                        },
                    });
                currentJob.job.CurrentAcceptedEmployee = [];
            } else {
                return next(
                    new AppError(
                        `${currentStatus}, This status don't match with criteria.`,
                        400
                    )
                );
            }
            const result = await mongo.db('CUPartTime').collection('Job').updateOne({
                _id,
            }, {
                $set: currentJob,
            });

            if (result) {
                console.log(
                    `${result.matchedCount} document(s) matched the query criteria.`
                );
                console.log(`${result.modifiedCount} document(s) was/were updated.`);
                res.status(200).json(result);
            } else {
                return next(new AppError(`Can't updata this job status.`, 404));
            }
        } else {
            return next(new AppError('Not found this job!', 404));
        }
    } catch (err) {
        throw new Error(err.message);
    }
});