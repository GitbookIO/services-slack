var express = require('express');
var url = require('url');
var Slack = require('node-slack');
var GitBookMiddleware = require('gitbook-webhook-middleware');

var app = express();
var gitbookMiddleware = GitBookMiddleware();

var EVENTS = {
    'publish': function(payload) {
        var book = payload.book;
        var build = payload.build;
        return '<'+build.author.urls.profile+'|'+build.author.name+'> published a new update of <'+book.urls.access+'|'+book.title+'>';
    },
    'thread': function(payload) {
        var book = payload.book;
        var thread = payload.thread;
        return 'Discussion <'+thread.urls.details+'|#'+thread.number+'> "'+thread.title+'" has been ' + payload.action;
    },
    'thread_comment': function(payload) {
        var book = payload.book;
        var thread = payload.thread;
        var comment = payload.comment;
        return '<'+comment.user.urls.profile+'|'+comment.user.name+'>" commented on discussion <'+thread.urls.details+'|#'+thread.number+'> "'+thread.title+'"';
    }
};


app.get('/', function (req, res) {
    res.redirect('https://github.com/GitbookIO/services-slack');
});

app.post('/hook/v1/:tokens([\\/.\\w]*|)', gitbookMiddleware, function (req, res, next) {
    var messageBuilder = EVENTS[req.headers['x-gitbook-event']];

    if (!messageBuilder) {
        return res.status(200).end();
    }

    // Extract payload
    var payload = req.body.payload;

    // Build slack client
    var hookUrl = url.resolve('https://hooks.slack.com/services/', req.params.tokens)
    var slack = new Slack(hookUrl);

    slack.send({
        text: messageBuilder(payload),
        username: 'GitBook',
        icon_url: 'https://www.gitbook.com/assets/images/logo/128.png'
    }, function(err, body) {
        if (err) next(err);
        else res.send({ ok: true });
    });
});

app.use(function(err, req, res, next) {
    console.error(err.stack || err);
    res.status(500).send(err.message || err);
});

var server = app.listen(process.env.PORT || 6001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Service listening at http://%s:%s', host, port);
});