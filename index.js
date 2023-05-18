const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbpicg2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db("toyWorld").collection("toys");

    app.get("/toys", async (req, res) => {
      const limit = 20;
      const cursor = toyCollection.find().limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/singletoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/toy/:email", async (req, res) => {
      const toys = await toyCollection
        .find({
          sellerEmail: req.params.email,
        })
        .toArray();
      res.send(toys);
    });
    app.get("/toyname/:name", async (req, res) => {
      const toys = await toyCollection
        .find({
          toyName: req.params.name,
        })
        .toArray();
      res.send(toys);
    });

    app.post("/addToys", async (req, res) => {
      const addToys = req.body;
      console.log(addToys);
      const result = await toyCollection.insertOne(addToys);
      res.send(result);
    });

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          details: body.details,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy World Server is Running");
});

app.listen(port, () => {
  console.log(`Toy World Server is running on port ${port}`);
});
