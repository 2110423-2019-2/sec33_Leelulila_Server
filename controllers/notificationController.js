const catchAsync = require('../utils/catchAsync');

exports.readNotification = catchAsync(async (req, res, next) => {
    const mongo = req.app.locals.db;
    const email = req.body.Email;
    const result = await mongo
        .db('CUPartTime')
        .collection('Users')
        .updateOne({
            email,
        }, {
            $set: {
                'notification.$[element].status': 1,
            },
        }, {
            multi: true,
            arrayFilters: [{
                'element.status': 0,
            }, ],
        });
    if (result.modifiedCount > 0) {
        res.status(200).json({
            status: 'success',
        });
    } else {
        res.status(404).json({
            status: 'fail',
        });
    }
});