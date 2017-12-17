2017 12/17　小森  
Node.jsでの通信 + enchnat.js の動作がうまくいったのでgitにしました。  
  
これを自分のパソコンでいじる場合は、コマンドプロンプトで任意のフォルダにいき  
	git clone https://github.com/mokkorin/j13_jinsei_no_hanmichi  
とやってくだせぇ  
  
リポジトリの名前ミスりましたhanmichiになってます  
  
  
フォルダ構成は  
* j13_jinsei_no_hanmichi/  
	|  
	├ - * image/			画像データのディレクトリ  
	|  
	├ - * js/  
	|	   └ - lib/  
	|	   |   └enchant.min.js  
	|	   |  
	|	   └* **main.js**ゲームを動かすメインのコード。クライアントサイドで動く  
	|  
	├ - * node_modules/	通信に必要なモジュールがいろいろ入ってるディレクトリ  
	|  
	├ - * **app.js** 			サーバー側のコード  
	|  
	├ - * index.html 		main.jsを表示するためのhtml。  
	|  
	├ - * .gitignore		あんま関係ないけど必要  
	├ - * package.json 	上と一緒  
	├ - * package.lock.json 	上と一緒  
	├ - * Procfile		上と一緒  
	└ - * README.md 		この文章を表示しているファイル  
となってます。  
  
太字が主に編集するファイルだと思います。  
  