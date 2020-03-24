'use strict';


var createUser = require('./mongo');

it("Create User Success",() =>{
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://admin:cuparttime2020@cluster0-rjut3.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });

    // var encryptedData = req.body.data;
    // let bytes = CryptoJS.AES.decrypt(encryptedData,'123456');
    // var payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const newUser={};
    const res={};
    var q = createUser(client,newUser,res);
    // console.log(q)
    // expect(1).toBe(1);

})