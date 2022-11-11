const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.lf7jbxk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req,res,next)=>{
    const headerInfo = req.headers.authorization;
    if(!headerInfo){
        return res.status(401).send({message:"Unauthorized Access"});
    } 
    const token = headerInfo.split(' ')[1];
    jwt.verify(token, process.env.SECURE_PASSWORD_JWT , function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })
}

const run = async () => {
    const servicesCollection = client.db("assignment11").collection("services");
    const reviewsCollection = client.db("assignment11").collection("reviews");
    try {
        // jwt 1st step to create a token
        app.post('/jwt', async (req, res) => {
            const userEmail = req.body;
            console.log(userEmail);
            const token = jwt.sign(userEmail , process.env.SECURE_PASSWORD_JWT , { expiresIn: '1d' });
            console.log(token);
            res.send({token});
        })


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
        app.post ('/services',async(req,res)=>{
            const service = req.body;
            console.log(service);
            const result = await servicesCollection.insertOne(service);
            res.send(result);
        })
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        })
        // jwt 2nd step
        app.get('/reviews',verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }
            // here jwt work has been finished
            const email = req.query.email;
            const serviceID = req.query.serviceID;
            let query = {};
            if (email) query = { "email": email };
            else if (serviceID) query = { "serviceID": serviceID };
            const data = reviewsCollection.find(query);
            const result = await data.toArray();
            res.send(result);
        })
        app.get('/reviews/:id',async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.findOne(query);
            res.send(result);
        })
        app.put('/reviews/:id',async(req,res)=>{
            const id = req.params.id;
            const review = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateUser = {  $set : { serviceReview:review } }  
            const result = await reviewsCollection.updateOne(query, updateUser, options);
            res.send(result)
        })
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
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