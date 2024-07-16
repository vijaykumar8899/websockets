const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const WebSocket = require("ws");


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const Product = require("./product");
const WebsocketModel = require("./websocket_model");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const productData = [];

// mongodb+srv://<jaykumarm416>:<T8E7pRMGZEt6d3ZO>@cluster0.mrtwxtk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

//connect mongoose
mongoose.set("strictQuery", true);
mongoose.connect(
  "mongodb+srv://jaykumarm416:T8E7pRMGZEt6d3ZO@cluster0.mrtwxtk.mongodb.net/flutter"
);

const db = mongoose.connection;

db.once("open", async () => {
  try {
    console.log("connected to mongodb");
    //post api
    app.post("/api/add_product", async (req, res) => {
      console.log("req = ", req.body);

      let data = Product(req.body);
      // print("the data here =  ", data);

      try {
        let dataToStore = await data.save();

        res.status(200).json(dataToStore);
      } catch (e) {
        res.status(400).json({
          status: error.message,
        });
        print("error at catch post :", e);
      }

      // const pdata = {
      //   id: productData.length + 1,
      //   pname: req.body.pname,
      //   pprice: req.body.pprice,
      //   pdesc: req.body.pdesc,
      // };

      // productData.push(pdata);
      // console.log("final", pdata);

      // res.status(200).send({
      //   statusCode: "200",
      //   message: "product added successfully",
      //   product: pdata,
      // });
    });

    //get api
    app.get("/api/get_product/", async (req, res) => {
      try {
        let data = await Product.find();
        res.status(200).json(data);
      } catch (e) {
        res.status(500).json(error.message);
      }
      // if (productData.length > 0) {
      //   res.status(200).send({
      //     statusCode: "200",
      //     products: productData,
      //   });
      // } else {
      //   res.status(200).send({
      //     statusCode: "200",
      //     products: [],
      //   });
      // }
    });

    // GET API to fetch WebSocketModel documents by ID
    app.get("/api/get_websocket_data/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10); // Ensure the ID is an integer
        if (isNaN(id)) {
          return res.status(400).json({ status: "error", message: "Invalid ID" });
        }

        // Fetch data from the database by ID
        const data = await WebsocketModel.find({ id: id });
        res.status(200).json(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ status: "error", message: error.message });
      }
    });

    
    // Handle WebSocket connections
    wss.on("connection", (ws) => {
      console.log("New client connected");

      ws.on("message", async (message) => {
        try {
          const { id, text } = JSON.parse(message);

          // Process the received data as needed
          console.log(`Received ID: ${id}, Text: ${text}`);

          // Example: Store the data in MongoDB
          const newData = new WebsocketModel({message: text, id: id });
          const savedData = await newData.save();

          // Send a response back to the client
          ws.send(JSON.stringify({ status: "success", data: savedData }));
        } catch (error) {
          console.error("Error processing message:", error);
          ws.send(JSON.stringify({ status: "error", message: error.message }));
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected");
      });
    });

    server.listen(3000, () => {
      console.log("Connected to server at port 3000");
    });


  } catch (e) {
    console.log("ERROR connected to mongodb", error);
  }
});

