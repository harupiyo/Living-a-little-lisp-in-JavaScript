/*
( ) を読み取る
*/

// 1文字づつ読み込み、デリミタ文字でトークンを切り出す
var tokens = [];
var tok = [];
var paren_level = 0;	// カッコの入れ子レベルを認識する

function reader (str) {
	if(str.length == 0){
		// 中途半端な開きカッコやトークン処理が残っていなければ
		// トークン処理が終わったので全トークンを返す
		if(paren_level == 0 && tok.length == 0){
			var t = tokens;
			tokens = [];	// トークンを返したらtokens は初期化
			return t;
		}
		// そうでなければなにもしない
		else{
			return;
		}
	}

	var c = str[0];
	switch(c){
		// DELIMITER1: White Space Characters
		case " ":
		case "\t":
		case "\n":
			finish_token();
			break;
		// DELIMITER2: parenthesis ()
		case ")":
			finish_token();
			paren_level--;
			tokens.push(')');
			break;
		case "(":
			finish_token();
			paren_level++;
			tokens.push('(');
			break;
		default:
			tok.push(c);
			break;
	}
	return reader(str.slice(1));
}

// トークン完成
function finish_token (){
	if(tok.length != 0){
		tokens.push(tok);
		tok = [];
	}
}

console.log( reader("(hello)") );
console.log( reader("(hello) (world)") );
console.log( reader("(h(el)lo)") );

console.log( reader(
`(defun fact (n)
	(if (zerop n) 1
		(* n (fact (1- n)))))`) );

console.log( reader( `(` ));		// undefined
console.log( reader( `hello` ));	// undefined
console.log( reader( `( foo` ));	// undefined
console.log( reader( `))` ));		// ["(",["h","e","l","l","o"],"(",["f","o","o"],")",")"]
