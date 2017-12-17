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

/* 配列の中身をシャッフルする関数 */
function shuffle(array)
{
	var n = array.length, t, i;

  	while (n) {
    	i = Math.floor(Math.random() * n--);
    	t = array[n];
    	array[n] = array[i];
    	array[i] = t;
  	}

  	return array;
}


var id = 0;		//アクセス数
var userHash = {};		//アクセスしているユーザのハッシュ
var order = {};		//すごろくの順番

/* アクセスを感知したら動く */
io.sockets.on('connection', function(socket){
	id++;
	userHash[socket.id] = id;
	socket.emit('setID', id);  //引数のsocket only に送信
	socket.broadcast.emit('player enter', id);	//他のプレイヤーが入ってきたことを通知

	/* change id を受信したら対応するidを変更し、結果を送る */
	socket.on('change id', function(data){
		socket.emit('setID', data);
		userHash[socket.id] = data;
	});

	/*
	if(id > 1){
		io.sockets.emit('start game');
	}
	*/
	
	/* 切断を感知したら全員に切断を通知する */
	socket.on('disconnect', function(){
		io.sockets.emit('disconnect player', userHash[socket.id]);
		userHash[socket.id] = null;
		id--;
	});
});