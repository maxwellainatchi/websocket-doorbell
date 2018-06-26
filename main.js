let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/bellaudio', function(req, res) {
    res.sendFile(__dirname + '/doorbell.mp3');
});

io.on("connection", function(socket) {
    socket.on('ring', function(socket){
        io.emit("ring bell");
        console.log("RING");
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
    