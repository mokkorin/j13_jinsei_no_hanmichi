enchant();

/* 画面中央表示の関数 */
var moveStageToCenter = function(core) {
	 var stagePos = {
	  	top: (window.innerHeight - (core.height * core.scale)) / 2,
	 	left: (window.innerWidth - (core.width * core.scale)) / 2,
	 };
	 var stage = document.getElementById('enchant-stage');
	 stage.style.position = 'absolute';
	 stage.style.top = stagePos.top + 'px';
	 stage.style.left = stagePos.left + 'px';
	 core._pageX = stagePos.left;
	 core._pageY = stagePos.top;
};


/* メイン関数 */
window.onload = function(){
	var core = new Core(620, 420);
	core.preload('./image/chara1.png');

	core.onload = function(){
		moveStageToCenter(core);	//画面を中央に表示

		/* core.onload()関数内の大域変数 */
		var socket = io.connect();
		var myID = 0;


		/* メニューシーンを生成する関数 */
		var MenuScene = function(){
			var scene = new Scene();
			var id_message = new Label();
			var info_message = [null, null, null, null, null];		//メッセージログ。直近5個まで表示
			var add_info = "";		//info_messageに追加する文字列

			scene.backgroundColor = "rgb(0, 200, 250)";	//sceneの背景色の設定

			for(var i=0; i<info_message.length; i++){
				info_message[i] = new Label(' ');
				info_message[i].font = '20px Arial';
				info_message[i].x = 50;
				info_message[i].y = (core.height/2) + (info_message[i]._boundHeight*i);
			}

			
			socket.on('setID', function(data){
				myID = data;
				id_message.text = "あなたはPlayer" + myID + "です";	
				id_message.font = '15px Arial';
				id_message.x = core.width - (50 + id_message._boundWidth);
				id_message.y = core.height-50;
				scene.addChild(id_message);
			});

			/* 他のプレイヤーが参加したのを感知 */
			socket.on('player enter', function(data){
				add_info = "Player" + data + "が参加しました";		//ログを追加
			});

			/* 他のプレイヤーの切断を感知 */
			socket.on('disconnect player', function(data){
				if(data < myID){
					myID--;		//切断したプレイヤーのidが自分より小さかった時セットしなおす
					socket.emit('change id', myID);
				}
				add_info = "Player" + data + "が退出しました";		//ログを追加
			});

			/* フレームごとに行う */
			scene.addEventListener(Event.ENTER_FRAME, function(){
				if(add_info != ""){
					for(var i=1; i<info_message.length; i++){
						info_message[i-1].text = info_message[i].text;
					}
					info_message[info_message.length-1].text = add_info;
					add_info = "";
					for(var i=0; i<info_message.length; i++){
						scene.addChild(info_message[i]);
					}
				}

			});

			/*	
			socket.on('start game', function(){
				core.replaceScene(GameScene());
			});
			*/

			return scene;
		};



		var GameScene = function(){
			var scene = new Scene();

			scene.backgroundColor = "rgb(50, 200, 50)";	//sceneの背景色の設定			

			return scene;
		};

		core.replaceScene(MenuScene());

		
	};
	core.start();
};