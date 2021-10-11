/*
単語を認識する

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String#character_access
https://stackoverflow.com/questions/1155678/javascript-string-newline-character
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/slice
*/

// 1文字づつ読み込み、デリミタ文字でトークンを切り出す
var tokens = [];
var tok = [];
function reader (str) {
	console.trace();
	if(str.length == 0){
		console.log('end reader');
		console.log(tok);
		console.log(tokens);
		// 中途半端なトークン処理が残っていなければトークン処理が終わったので全トークンを返す
		if(tok.length == 0){
			console.log('return tokens');
			return tokens;
		}
		// そうでなければなにもしない
		else{
			return;
		}
	}

	var c = str[0];
	switch(c){
		case " ":
		case "\n":
			if(tok.length != 0){
				console.log('build token');
				// トークン完成
				tokens.push(tok);
				tok = [];

				console.log(tokens);
			}
			break;
		default:
			tok.push(c);
			console.log(tok);
			break;
	}
	return reader(str.slice(1));
}

console.log( reader("hello world ") );

