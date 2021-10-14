/*
リーダーは、シンボルと識別した際に値(SYMBOL-VALUE) に置き換える

MEMO
2. (quote) のサポート
let quoting = true:Boolean	// quote の影響下にあるかどうか
*/

import { Package } from '../package/level3.ts'
import { LSymbol } from '../symbol/level2.ts'
import { Value } from '../value/level2.js';

let p0 = new Package("COMMON-LISP", [null])
let [s0,ret] = p0.intern("MACHINE-TYPE")
s0.set( new Value("STRING", "inside JavaScript") )

// current package as *package*
// 予約語 package を避け、l_package とした
const l_package: Package = p0

let tokens: Array<string|Value> = []
let tok: Array<string|Value> = []
let paren_level: number = 0
let type_number_p: Boolean = true
let point_number: number = 0	// 小数点記号の現れる回数

function reader(exp:string): Array<string|Value>|void {
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
		let token: string|Value = tok.join('')
		if( ! type_number_p ){
			// シンボル識別子なら、シンボルを取得してその値に置き換える
			// この仕事はreader 側で行い、eval 側には値のみを渡す
			let s = l_package.find_symbol( token )
			if ( s === "nil" ){
				throw(`The variable ${token} is unbound. 変数${token}に値が束縛されていません`)
			}
			token = s.symbol_value()
		}else{
			console.debug('read number')
		}

		// 完成したトークンを格納
		tokens.push(token)

		// READ 制御用変数の初期化
		type_number_p = true
		point_number = 0
		tok = []
	}
}

// 1. シンボルがあればその値に置き換える
console.log( reader("123 MACHINE-TYPE ") )
	/*
		[
		  "123",
		  Value { tag: { type: "STRING", constant: false }, val: "inside JavaScript" }
		]
	*/

// 2. シンボルがなければエラーが発生する
console.log( reader("FOO ") ) // error: Uncaught The variable FOO is unbound. 変数FOOに値が束縛されていません
