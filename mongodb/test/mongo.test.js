const {createUser} = require('../mongo');

it("Create User Success",() =>{
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://admin:cuparttime2020@cluster0-rjut3.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });

    // var res = createUser(client,newUser,res);
    // expect(1).toBe(1);

})