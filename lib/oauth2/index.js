/**
 * Module dependencies.
 */
var express = require('express');
var request = require('request');
var qs = require("querystring");
var util = require('util');
var program = require('commander');
var fs = require('fs');
var theme = require('../theme.js');
var vars = require('../vars.js');

program
    .option('-c, --component <id>', 'Component id')
    .option('-p, --port [port]', "Application's port")
    .parse(process.argv);

var component = program.component;
var port = program.port || 5000;

if (!component) {
    program.help();
}

var realPath = fs.realpathSync('lib/' + component + '/component.json', {});

if (!fs.existsSync(realPath)) {
    console.log('No component descriptor found. Please define component descriptor in file: %s'.error, realPath);
    return;
}

var metadata = JSON.parse(fs.readFileSync(realPath, 'utf8'));

var oauth2 = metadata.oauth2;

if (!oauth2) {
    console.log('%s property is missing in file: %s'.error, oauth2, realPath);
    return;
}

var redirectUrl = util.format("http://localhost:%d/callback/oauth2", port);

var app = module.exports = express.createServer();


// Configuration
app.configure(function () {
    'use strict';
    app.use(express.bodyParser());
    app.use(express.cookieParser('RtWWgQ3A'));
    app.use(express.session({secret:'h7FoiiugA5GwDJrNcSStu3fW2eETlvn5tPlsd7AAicw8uxM3gzAFP8tBB1T42q'}));
    app.use(express["static"](__dirname + '/public'));
});


app.get('/', function (req, res) {
    res.render('index.html');
});

app.post('/auth', function (req, res, next) {

    var envVars = vars.readEnvVars();

    var resolved = vars.resolveVarsFromContext(JSON.stringify(oauth2), envVars);

    var authUri = resolved['auth_uri'];
    var tokenUri = resolved['token_uri'];
    var clienId = resolved['client_id'];
    var clientSecret = resolved['client_secret'];
    var scopes = resolved['scopes'];

    var session = req.session;

    session.auth = {
        clienId:clienId,
        clientSecret:clientSecret,
        tokenUri:tokenUri
    };

    var query = {
        "response_type":"code",
        "client_id":clienId,
        "redirect_uri":redirectUrl,
        "access_type":"offline",
        "approval_prompt":"force"
    };

    if(scopes){
        query.scope = scopes.join(' ');
    }

    var oauthURL = authUri + '?' + qs.stringify(query);

    res.redirect(oauthURL);
    res.end();
});

app.get('/callback/oauth2', function (req, res) {
    'use strict';
    var code = req.query.code;
    var error = req.query.error;
    var session = req.session;

    if (error) {
        res.status(400).send(error);

    } else if (code) {
        var tokenUri = session.auth.tokenUri;

        var tokenBody = {
            code:code,
            'client_id':session.auth.clienId,
            'client_secret':session.auth.clientSecret,
            'redirect_uri':redirectUrl,
            'grant_type':'authorization_code'
        };

        request.post({
            uri:tokenUri,
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:qs.stringify(tokenBody)
        }, function (err, response, body) {

            if(err) {
                res.status(response.statusCode).send(err);
            }else {

                res.json(JSON.parse(body));
            }

        });

    }
});

app.listen(port, function () {
    'use strict';
    console.log("Express server listening on port %d in %s mode".info, app.address().port, app.settings.env);
});
