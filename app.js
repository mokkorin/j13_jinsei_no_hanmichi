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

var id = 0;
var userHash = {};
io.sockets.on('connection', function(socket){
	id++;
	userHash[socket.id] = id;
	socket.emit('setID', id);  //引数のsocket only にemit
	socket.broadcast.emit('player enter', id);
	socket.on('change id', function(data){
		socket.emit('setID', data);
		userHash[socket.id] = data;
	});

	socket.on('disconnect', function(){
		io.sockets.emit('disconnect player', userHash[socket.id]);
		userHash[socket.id] = null;
		id--;
	});
});