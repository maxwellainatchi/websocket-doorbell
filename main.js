let Express = require('express');
let app = Express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let bodyParser = require('body-parser');
let urlEncodedParser = bodyParser.urlencoded({extended: false});

app.use(Express.static(__dirname + "/public"));
app.set('view engine', "pug");

let baseURL;
if (process.env.PORT) {
    baseURL = "https://tenebris-lab-doorbell.herokuapp.com/"
} else {
    baseURL = "http://localhost:3000";
}

app.get('/', function(req, res){
    res.render('index', { baseURL });
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
    