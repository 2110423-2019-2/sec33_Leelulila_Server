const authController = require('./authController');


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
    users.userLogin(client, payload, res);
});

app.get('/userlogout', (req, res) => {
    authController.logout(req, res);
})

app.get('/user/:id', authController.protect, (req, res) => {
    //get all list of db
    console.log('fromgetuserid', req.cookies);
    const id = parseInt(req.params.id);
    users.findUserByID(client, id, res);
});
app.get('/useremail/:email', authController.protect, (req, res) => {
    //get all list of db
    console.log('fromgetuseremail', req.cookies);
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

exports.createUser = async function (client, newUser, res) {
    try {
        const sequenceName = 'productid';
        const id = await client.db('CUPartTime').collection('counters').findOne({
            _id: sequenceName,
        });
        await client
            .db('CUPartTime')
            .collection('counters')
            .updateOne({
                _id: sequenceName,
            }, {
                $inc: {
                    sequence_value: 1,
                },
            });

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


        authController.createSendToken(result.ops[0], 201, res);
        // console.log(`New User created with the following id: ${result.insertedId}`);
        res.json(`New User created success`); //with the following id: ${result.insertedId}`);
    } catch (e) {
        console.error(e);
    }
}
exports.userLogin = async function (client, user, res) {
    try {
        const {
            email,
            pass
        } = user;

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
exports.findUserByID = async function (client, id, res) {
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

exports.findUserByEmail = async function (client, email, res) {
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

exports.updateUserByID = async function (client, id, updatedName, res) {
    try {
        result = await client.db('CUPartTime').collection('Users').updateOne({
            _id: id,
        }, {
            $set: updatedName,
        });

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