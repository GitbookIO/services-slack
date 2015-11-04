var express = require('express');
var url = require('url');
var Slack = require('node-slack');
var GitBookMiddleware = require('gitbook-webhook-middleware');

var app = express();
var gitbookMiddleware = GitBookMiddleware();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/hook/v1/:tokens([\\/.\\w]*|)', gitbookMiddleware, function (req, res, next) {
    console.log('receive', req.headers['x-gitbook-event'], req.body);
    if (req.headers['x-gitbook-event'] !== 'publish') {
        return res.status(200).end();
    }

    // Extract payload
    var payload = req.body.payload;
    var book = payload.book;

    // Build slack client
    var hookUrl = url.resolve('https://hooks.slack.com/services/', req.params.tokens)
    var slack = new Slack(hookUrl);

    slack.send({
        text: 'New update on '+book.title,
        username: 'GitBook',
    })
    .then(function() {
        res.send({ ok: true });
    }, next);
});

var server = app.listen(process.env.PORT || 6001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Service listening at http://%s:%s', host, port);
});