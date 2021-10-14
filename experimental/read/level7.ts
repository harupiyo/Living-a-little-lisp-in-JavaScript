/*
READ がシンボルをどう扱うかの考察

今、READ はシンボルを見つけたらその値に置き換えるようにした

	**しかしこれは大きな誤解だと思う**

READ が行うのはシンボル識別子を認識し、その名前のシンボルがなければ新規作成しpackage にintern するというだけだろう。

そのシンボルを覗いて(除き方にはシンボルの置かれる場所に応じて SYMBOL-VALUE, SYMBOL-FUNCTION のあるいはQUOTE を使ったありのままの３種類がある) 値なり関数なりを取り出して、あるいはQUOTE によって記号として使うのは EVAL 側であるはずだ。

http://www.lispworks.com/documentation/lw60/CLHS/Body/f_rd_rd.htm
	'a => (quote A) に変換するだけで、(quote A) をどう扱うかはEVAL 側に託す

READ がなすべき仕事についてはどこに書いてあるのか？
http://www.lispworks.com/documentation/lw60/CLHS/Body/23_a.htm

うまく探しきれていない。
ひとまず実装を変えて前進しながら調べ・考えていこう。

	前進(して失敗)することは考えが進むことと同じである。

		愚者は失敗に学び 賢者は歴史に学ぶ
		https://ja.wikiquote.org/wiki/%E3%82%AA%E3%83%83%E3%83%88%E3%83%BC%E3%83%BB%E3%83%95%E3%82%A9%E3%83%B3%E3%83%BB%E3%83%93%E3%82%B9%E3%83%9E%E3%83%AB%E3%82%AF

		ハッカーは両方から学ぶ

	そうありたい。

改修:
- [ボツ] シンボルを見つけたらその値に置き換える←止める
- シンボル識別子を認識した際、その名前のシンボルがなければ新規作成しpackage にintern する。

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

let tokens: Array<string> = []
let tok: Array<string> = []
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
		let token: string = tok.join('')
		if( ! type_number_p ){
			// シンボル識別子なら、シンボルが存在するか調べ、
			// なければ新しくシンボルを作成し、パッケージにintern する
			let s = l_package.find_symbol( token )
			if ( s === "nil" ){
				l_package.intern(token)
			}
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

// 1. 指定した名前のシンボルがある場合はパッケージにはなにも起こらない
console.debug(l_package)	// "MACHINE-TYPE" のみ存在
reader("123 MACHINE-TYPE ")
console.debug(l_package)	// "MACHINE-TYPE" のみ存在

// 2. その名のシンボルがなければシンボルを作成し現在のパッケージにintern する
reader("FOO ")
console.debug(l_package)	// "MACHINE-TYPE" "FOO" の２つが存在
