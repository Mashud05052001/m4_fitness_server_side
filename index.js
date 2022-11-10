const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.lf7jbxk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    const servicesCollection = client.db("assignment11").collection("services");
    try {
        app.get('/services', async (req, res) => {
            const count = parseInt(req.query.count);
            const query = {};
            const data = servicesCollection.find(query);
            let result = [];
            if (count) {
                result = await data.limit(count).toArray();
            }
            else {
                result = await data.toArray();
            }
            res.send(result);
        })
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })
    }
    finally {
        console.log("DONE");
    }
}
run().catch(console.dir);






app.get('/', (req, res) => res.send('The milestone 11 backend server is running'));
app.listen(port, (req, res) => console.log(`The backend server is running on ${port} port`));