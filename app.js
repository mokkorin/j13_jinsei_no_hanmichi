const MASU_MAX = 20;	//ここを変えるならmain.js側も変えるべし

const PLUS_MASU = 0;
const MINUS_MASU = 1;
const ITEM_MASU = 2;
const EVENT_MASU = 3;
const NORMAL_MASU = 4;

/*------関数群------*/

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

/* マップのデータを生成する関数 */
function mapDataCreate(map)
{
    var ratios = new Array(5);	//マスの種類の出現割合を示す配列
    ratios[PLUS_MASU] = 10;		//プラスマスの割合
    ratios[MINUS_MASU] = 5;		//マイナスマスの割合
    ratios[ITEM_MASU] = 5;		//アイテムマスの割合
    ratios[EVENT_MASU] = 0;		//イベントマスの割合
    ratios[NORMAL_MASU] = 0;	//ノーマルマスの割合

    var type;
    var i = 0;
    while(i < map.length){
	type = Math.floor(Math.random()*5);
	if(ratios[type] != 0){
	    map[i] = type;
	    ratios[type]--;
	    i++;
	}
    }
}

/* ------ここからメイン------- */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var xlsx = require('xlsx');
let db = xlsx.readFile('db.xlsx');
let masu_sheet = db.Sheets['Event'];
var wei = xlsx.utils.decode_range(masu_sheet['!ref']);
console.log(wei);

var PORT = process.env.PORT || 3000;

app.use('/js', express.static(__dirname + '/js'));
app.use('/image', express.static(__dirname + '/image'));

app.get(`/`, (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

var id = 0;		//アクセス数
var userHash = {};		//アクセスしているユーザのハッシュ
var order = [];	//すごろくの順番
var mapdata = new Array(MASU_MAX);	//map生成のデータ

mapDataCreate(mapdata);				//map生成

/* アクセスを感知したら動く */
io.sockets.on('connection', function(socket){
    id++;
    if(id > 4){

    }
    else{
	    userHash[socket.id] = id;
	    order.push(socket.id);
	    socket.emit('initialize', id);  //引数のsocket only に送信
	    socket.broadcast.emit('player enter', id);	//他のプレイヤーが入ってきたことを通知

	    /* change id を受信したら対応するidを変更し、結果を送る */
	    socket.on('change id', function(data){
			socket.emit('setID', data);
			userHash[socket.id] = data;
	    });

	    /* クライアント側からgame initializeを受けとったら実行される */
	    socket.on('game initialize', function(){
			order = shuffle(order);
			io.sockets.emit('init', mapdata, id);
	    });

	    socket.on('ready', function(){
			socket.emit('start game');
			socket.broadcast.emit('start game');
	    });
	    
	    socket.on('game turn', function(turn){
	    	if(socket.id == order[turn]){
	    		socket.emit('your turn');
	    	}else{
	    		socket.emit('other turn', userHash[order[turn]]);
	    	}
	    });

	    /* 切断を感知したら全員に切断を通知する */
	    socket.on('disconnect', function(){
			io.sockets.emit('disconnect player', userHash[socket.id]);
			userHash[socket.id] = null;
			id--;
	    });
	}
});
