/*
リーダーがシンボルかそうでないかを認識する仕組みを入れる
どの文字の組み合わせでシンボルと認識するかの考察は
	'../symbol/level3.ts'
   で行っているので、それに従う。

今回はシンボルか、数字かの２種類だけを認識する
	パッケージ名も認識しない
*/

let tokens: string[] = []
let tok: string[] = []
let paren_level: number = 0
let type_number_p: Boolean = true
let point_number: number = 0	// 小数点記号の現れる回数

function reader(exp:string): Array<string>|void {
	// 再帰呼出しにより
	// 文字列の末尾に達していたら
	if(exp.length == 0){
		// カッコの対応も取れ、未処理のトークンがなく
		// reader として処理が完結していれば
		if(paren_level == 0 && tok.length == 0){
			let t = tokens
			tokens = []	// 処理用のバッファをクリアし
			return t	// この時点でのtokens の内容を返す
		}
		// 情報が足りず、reader のしごとが中途半端な状態であれば
		// 意味のあるものは返さない
		else{
			return
		}
	}

	let c = exp[0]
	switch(c){
		// DELIMITER1: White Space Characters
		case " ":
		case "\t":
		case "\n":
			finish_token()
			break
		// DELIMITER2: parenthesis ()
		case ")":
			finish_token()
			paren_level--
			tokens.push(')')
			break
		case "(":
			finish_token()
			paren_level++
			tokens.push('(')
			break
		default:
			// これらの文字が１文字でもあればシンボルを指す
			// - アルファベット(大小文字)
			// - 記号 !, @, $, %, ^, &, *, -, _, =, +, ~, [, ], {, }, ?, /
			if( /[A-Za-z!@$%^&*\-_=+~\[\]{}?\/]/.test(c) ){
				type_number_p = false	// 数字ではない
			}
			// 以下の文字はそれだけで構成されていれば数字とみなす
			// - 0-9
			// - .		ただし途中に一回だけ
			if( c === "." ){
				point_number++
				if( point_number > 1 ) type_number_p = false
			}
			tok.push(c)
			break
	}
	return reader(exp.slice(1))
}

// トークン完成
function finish_token(): void {
	if(tok.length != 0){
		let token = tok.join('')
		if( ! type_number_p ){
			console.debug('read symbol')
		}else{
			console.debug('read number')
		}
		// フラグの初期化
		type_number_p = true
		point_number = 0

		tokens.push(tok.join(''))
		tok = []
	}
}

console.debug( reader("123-456 ") )						// "read symbol"
console.debug( reader("*package* ") )					// "read symbol"
console.debug( reader("1234aAzZ!@$%^&*-_=+~[]{}?/ ") )	// "read symbol"
console.debug( reader("MACHINE-TYPE ") )				// "read symbol"
console.debug( reader("123 ") )							// "read number"
console.debug( reader("123.456 ") )						// "read number"
console.debug( reader("123.456.789 ") )					// "read symbol"
console.debug( reader(".456 ") )						// "read number"
console.debug( reader(".456.789 ") )					// "read symbol"


