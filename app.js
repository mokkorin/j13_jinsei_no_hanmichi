var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 3000;

app.use('/js', express.static(__dirname + '/js'));
app.use('/image', express.static(__dirname + '/image'));

app.get(`/`, (req, res) => {
  	res.sendFile(__dirname + '/index.html');
});


http.listen(PORT, () => {
	console.log(`listening on *:${PORT}`);
});


id = 0;
io.sockets.on('connection', function(socket){
	id++;
	console.log('connected : player' + id);
	socket.emit('hello', id);  //引数のsocket only にemit
});