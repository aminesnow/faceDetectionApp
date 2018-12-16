'use strict';

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cv = require('opencv');
var multer = require('multer');
var storage = multer.memoryStorage();



var app = express();

var server = http.createServer(app);

var port = 8000;
var host = 'localhost';


// Using morgan module to log incoming requests
app.use(morgan('dev'));



app.use( express.static(__dirname + '/www'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Server index page
app.get('/', function(req,res){
  res.sendFile(__dirname + '/www/index.html');
});


app.post('/api/images/upload',
   multer({
      storage: storage,
      limits: {files: 1}
   }).single('file'),
 function(req, res,next){
   cv.readImage(req.file.buffer, function(err, im){
     if (err) return res.status(500).send(err);

     var haarcascade_frontalface = './node_modules/opencv/data/haarcascade_frontalface_alt2.xml';
     im.detectObject(haarcascade_frontalface, {}, function(er, faces) {
       if (er) return res.status(500).send(er);

       for (var i = 0; i < faces.length; i++) {
         var face = faces[i];
         im.rectangle([face.x, face.y], [face.width, face.height], [0, 255, 0], 3);
       }
       return res.status(200).send({ buffer: im.toBuffer() });

     });
   });

});


server.listen(port, function () {
    var url = server.address().address + ':' + server.address().port;
    console.log('Website at: http://' + host +':' + port);
});


// WebSocket server
var io = require('socket.io')(server);
io.on('connection', function (socket) {
  console.log('client connected!');
  socket.on('stream', function(data) {
    cv.readImage(data, function(err, im){
      if (err) return console.log(500,err);

      var haarcascade_frontalface = './node_modules/opencv/data/haarcascade_frontalface_alt2.xml';
      im.detectObject(haarcascade_frontalface, {}, function(er, faces) {
        if (er) return console.log(er);;

        for (var i = 0; i < faces.length; i++) {
          var face = faces[i];
          im.rectangle([face.x, face.y], [face.width, face.height], [0, 255, 0], 3);
        }
        var arr = new Uint8Array(im.toBuffer().toString('base64'));
        socket.emit('faces', im.toBuffer().toString('base64'));

      });
    });

  });


});
