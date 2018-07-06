let Express = require('express');
let app = Express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let bodyParser = require('body-parser');
let urlEncodedParser = bodyParser.urlencoded({extended: false});
let superagent = require("superagent")
let slackToken = "xoxp-388050947686-387414541509-388148942546-fdb8483697f57a009aa125b46e3b9dba"

app.use(Express.static(__dirname + "/public"));
app.set('view engine', "pug");

app.get('/reloader', function(req, res, next) {
    if (req.query.password === "maxisthebest") {
        res.render('reloader');
    } else {
        next();
    }
});

app.post("/reload", urlEncodedParser, function(req, res, next) {
    io.emit("reload", req.body)
    console.log("reloading", req.body)
    res.redirect("/reloader?password=maxisthebest#reloaded");
})

app.post('/ringBell', urlEncodedParser, async function(req, res) {
    let data = await superagent.get(`https://slack.com/api/users.info?token=${slackToken}&user=${req.body.user_id}`)
    let user = data.body.user
    console.log(user.real_name + " rang from slack")
    io.emit("ring bell", { name: user.real_name, icon: user.profile.image_24 });
    res.send({
        "response_type": "in_channel",
        "text": `${user.real_name} rang the doorbell!`
    })
})

app.use(function(req, res) {
    res.render('index');
});

io.on("connection", function(socket) {
    socket.on('ring', function({ name }){
        io.emit("ring bell", { name });
        console.log(`${name} rang`);
    });
});

let port = process.env.PORT || 3000;
http.listen(port, function(){
    console.log('listening on *:3000');
});
    