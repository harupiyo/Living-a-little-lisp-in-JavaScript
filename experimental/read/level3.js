/*
気休め程度にトークンの格納方法をマシにする
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/toString
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/join
*/

var tokens = [];
var tok = [];
var paren_level = 0;

function reader (str) {
	if(str.length == 0){
		if(paren_level == 0 && tok.length == 0){
			var t = tokens;
			tokens = [];
			return t;
		}
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
		tokens.push(tok.join(''));
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

