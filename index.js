const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8v7rf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('brushWaremag').collection('tool');
        const addToolCollection = client.db('brushWaremag').collection('tool');

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