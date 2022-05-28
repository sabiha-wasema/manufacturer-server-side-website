const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8v7rf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('brushWaremag').collection('tool');
        const addToolCollection = client.db('brushWaremag').collection('tool');
        const userCollection = client.db('brushWaremag').collection('users');

        app.get('/tool', async (req, res) => {
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });

        // POST
        app.post('/tool', async (req, res) => {
            const newTool = req.body;
            const result = await addToolCollection.insertOne(newTool);
            res.send(result);
        });

        // DELETE
        app.delete('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await addToolCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        /* app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        });
 */
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });



        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            // console.log(token);
            res.send({ result, token });

        })



        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolCollection.findOne(query);
            res.send(tool);
        });

        app.put('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const updatedTool = Number(req.body.quantity)
            console.log(id, updatedTool);
            const filter = { _id: ObjectId(id) }

            const updateDoc = {
                $inc: {
                    quantity: +updatedTool
                }
            };
            const result = await toolCollection.updateOne(filter, updateDoc)
            res.send(result)
        });

        app.put('/delivery/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $inc: {
                    quantity: -1
                }
            };
            const result = await toolCollection.updateOne(filter, updateDoc)
            res.send(result)
        })




    }
    finally {

    }
}

run().catch(console.log)




app.get('/', (req, res) => {
    res.send('hello');
})

app.listen(port, () => {
    console.log("Listening to port", port);
})