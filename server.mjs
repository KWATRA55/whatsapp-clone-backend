// importing
import express from "express"
import mongoose from "mongoose"
import Messages from "./dbMessages.js";
import cors from 'cors'
import bodyParser from 'body-parser'
import Pusher from 'pusher'

// app config
let app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1459299",
    key: "e1217a2c45a7e571f259",
    secret: "90c87c6713b8a0654a4c",
    cluster: "mt1",
    useTLS: true
  });

// middleware
app.use(express.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
// app.use((req,res,next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     next();
// })
//app.use(Cors())

// DBconfig
const connection_url = `mongodb+srv://admin:admin@cluster0.0ykwgmv.mongodb.net/whatsappDB?retryWrites=true&w=majority`

mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.once("open", ()=> {
    console.log("DB connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch()

    changeStream.on("change", (change) => {
        console.log(change);

        if(change.operationType === "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                name : messageDetails.name,
                message : messageDetails.message,
                timestamp : messageDetails.timestamp,
                received : messageDetails.received,
            })
        } else{
            console.log("Error trigerring pusher")
        }
    })
})

// api Routes
app.get('/', (req,res) => res.status(200).send("hello world"));

app.get('/messages/sync', (req,res) => {
    Messages.find((err, data) => {
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(200).send(data);
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err);
        }
        else{
            res.status(201).send(data);
        }
    })
})


// listen
app.listen(port, () =>  console.log(`running on localhost : ${port}`));