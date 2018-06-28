let Express = require('express');
let app = Express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let bodyParser = require('body-parser');
let urlEncodedParser = bodyParser.urlencoded({extended: false});

app.use(Express.static(__dirname + "/public"));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.post('/ringBell', urlEncodedParser, function(req, res) {
    io.emit("ring bell");
    res.send({
        "response_type": "in_channel",
        "text": `${req.body.user_name} rang the doorbell!`
    })
})

io.on("connection", function(socket) {
    socket.on('ring', function(socket){
        io.emit("ring bell");
        console.log("RING");
    });
});

let port = process.env.PORT || 3000;
http.listen(port, function(){
    console.log('listening on *:3000');
});
    