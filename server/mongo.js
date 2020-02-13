


async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function main(){
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://admin:cuparttime2020@cluster0-rjut3.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });
    client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
    });
    //connect to db eiei
    try {
        await client.connect();

        await listDatabases(client);
    
    }
    catch (e) {
        console.error(e);
    }
    finally{
        await client.close();
    }
    
}
main().catch(console.error)