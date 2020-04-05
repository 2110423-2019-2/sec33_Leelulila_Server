const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;

// Catch UNCAUGHT EXCEPTION ERROR
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// ENV configuration
dotenv.config({
    path: './config.env'
});
const app = require('./app');

// Connect to the database
const uri = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

exports.mongo = client.connect()
    .then(() => console.log('DB connection successful!'))
    .catch((err) => console.log(err));

// Open server on port...
const port = process.env.PORT || 9000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// UNHANDLED ERROR handler
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    client.close();
    server.close(() => {
        process.exit(1);
    });
});