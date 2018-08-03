let Express = require('express');
let app = Express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let bodyParser = require('body-parser');
let urlEncodedParser = bodyParser.urlencoded({extended: false});
let superagent = require("superagent");
let slackToken = process.env.SLACK_TOKEN;
let reloadPassword = process.env.RELOAD_PASSWORD;

app.use(Express.static(__dirname + "/public"));
app.set('view engine', "pug");

app.use((req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`HTTP ${req.httpVersion} ${req.method} ${req.originalUrl} from ${ip}`);
    next();
})

app.get('/reloader', function(req, res, next) {
    if (req.query.password === reloadPassword) {
        res.render('reloader');
    } else {
        next();
    }
});

app.post("/reload", urlEncodedParser, function(req, res, next) {
    io.emit("reload", req.body)
    console.log("reloading", req.body)
    res.render("reloader", { reloaded: true });
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

let port = process.env.PORT;
let defaultPort = process.env.DEFAULT_PORT || 3000;
let listener = () => {
    console.log("listening on *:" + port);
}
if (port) {
    http.listen(port, listener);
    http.on('error', e => {
        if (e.code === 'EADDRINUSE') {
            console.log('Address in use, retrying...');
            setTimeout(() => {
                server.close();
                server.listen(port, listener);
            }, 1000);
        } else {
            throw e;
        }
    });
} else {
    port = defaultPort;
    http.listen(port, listener);
    http.on('error', e => {
        if (e.code === "EADDRINUSE") {
            http.listen(0, () => {
                port = http.address().port;
                listener();
            });
        } else {
            throw e;
        }
    })
}
