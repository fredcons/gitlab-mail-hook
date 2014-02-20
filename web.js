var express = require('express');
var mailer = require('express-mailer');
var engine = require('ejs').__express;

var app = express();

app.use(express.logger());
app.use(express.bodyParser());
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
});

mailer.extend(app, {
  from: 'pusher@gitlab.fullsix.com',
  host: 'smtp.sendgrid.net', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD
  }
});

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get('/ping', function(request, response) {
  response.send('Pong');
});

app.post('/commit', function(request, response){
  push = request.body;
  subject = '[gitlab push][' + push.repository.name + '][' + push.user_name + ']' 
  app.mailer.send('push', {
    to: 'noreply@noreply.com', 
    subject: subject,
    push: push 
  }, function (err) {
    if (err) {
      console.log(err);
      response.send('There was an error sending the email');
      return;
    }
    response.send('Ok');
  });

});

app.post('/debug', function(request, response){
  push = request.body;
  app.mailer.render('push', {
    to: 'frederic.cons@gmail.com',
    subject: '[gitlab push][' + push.repository.name + '][' + push.user_name + ']',
    push: push
  }, function (err, message) {
    if (err) {
      console.log(err);
    }
    response.header('Content-Type', 'text/plain');
    response.send(message);
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
