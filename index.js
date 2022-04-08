const express = require('express');
const cors  = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require("morgan");
const socketServer = require('socket.io');
const WebSockets = require('./src/socket/websocket');
const http = require('http');
require('dotenv').config();
require('./src/config/DBConnection');

const app = express();

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));

require('./src/routes/main.routes')(app);

app.get('/test', (req,res)=>{
    res.send({"message": "Call From Server"});
});

app.use('*', (req, res, next) => {
    return res.status(404).json({
      success: false,
      message: 'API endpoint doesnt exist'
    })
});

const webSockets = new WebSockets();
const httpServer = http.createServer(app);
global.io  = socketServer(httpServer, {cors: {
  origin: process.env.APP,
  methods: ["GET", "POST", "PUT"]
}});
global.io.on('connection', (client)=>{
  client.emit("connected", {"Msg":"Hello From Server"});
  webSockets.connection(client)
})

httpServer.listen( process.env.PORT || 4242, () => console.log(`Running on port ${process.env.PORT}`));