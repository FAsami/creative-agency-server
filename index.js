const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('orders'));
app.use(fileUpload());
app.use(cors());

const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const ordersCollection = client.db("creativeAgency").collection("orders");
    const reviewsCollection = client.db("creativeAgency").collection("reviews");
    const servicesCollection = client.db("creativeAgency").collection("services");
    const adminCollection = client.db("creativeAgency").collection("admin");

    app.get('/orders', (req, res) => {
        ordersCollection.find({}).toArray((err, docs) => res.send(docs));
    });
    app.get('/reviews', (req, res) => {
        reviewsCollection.find({}).limit(3).toArray((err, docs) => res.send(docs));
    });
    app.get('/services', (req, res) => {
        servicesCollection.find({}).limit(3).toArray((err, docs) => res.send(docs));
    });

    app.get('/service/:id', (req, res) => {
        servicesCollection.find({ _id: objectId(req.params.id) }).toArray((err, docs) => {
            res.send(docs[0]);
        });
    });
    app.get('/orders/:email', (req, res) => {
        ordersCollection.find({ email: req.params.email }).toArray((err, docs) => {
            res.send(docs);
        });
    });

    app.patch('/updateServiceStatus/:id/', (req, res) => {
        const id = req.params.id;
        const newStatus = req.body.status;
        ordersCollection.updateOne({ _id: objectId(id) }, { $set: { status: newStatus } })
            .then(result => res.send(result.modifiedCount > 0))
    });

    app.post('/placeOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.post('/addReview', (req, res) => {
        reviewsCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });
    app.post('/addAdmin', (req, res) => {
        adminCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.post('/addService', (req, res) => {
        const service = req.body;
        servicesCollection.insertOne(service)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });
});


app.get('/', (req, res) => {
    res.send('App is running')
})


const PORT = 5000;
app.listen(PORT || process.env.PORT, () => console.log(`App is running on port : ${PORT}`));