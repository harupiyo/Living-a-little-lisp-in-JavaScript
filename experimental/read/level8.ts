/*
READ は() を読み取ったらCONS オブジェクトを作成するはずだ

	CONS オブジェクトによって抽象構文木としてのS式を具現化しておく。
	そしてEVAL はそのCONS(LIST) を処理していく。

# 対応する () をCons オブジェクトに変換する

1.1 そのためにreader が作成するtokens を更に加工していく
	- 現状は["(" "123" "(" "A" ")" ")"] という一次元配列だが (flatten array)
	- ["123" ["A"]] の多次元配列に置き換える (un-flatten array)
1.2 多次元配列をCons リストに変換する(array to conses)
*/

import { Package } from '../package/level3.ts'
import { LSymbol } from '../symbol/level2.ts'
import { Value } from '../value/level2.js'
import { Cons } from '../cons/level2.ts'

let p0 = new Package("COMMON-LISP", [null])
let [s0,ret] = p0.intern("MACHINE-TYPE")
s0.set( new Value("STRING", "inside JavaScript") )

// current package as *package*
// 予約語 package を避け、l_package とした
const l_package: Package = p0	// MEMO これはpackage 側のファイルで持つべきかな？いや、もっとLisp全体を統括する部分で持つはずだ。今はここでよい。

export type atom = string | number | LSymbol | Value
export type s_expr = atom | Cons

let tokens: Array<string>	= []
let tok: Array<string>		= []
let paren_level: number		= 0
let type_number_p: Boolean	= true
let point_number: number	= 0	// 小数点記号の現れる回数

export function reader(input_str:string): s_expr|void {
	// 再帰呼出しにより
	// 文字列の末尾に達していたら
	if(input_str.length == 0){
		// カッコの対応も取れ、未処理のトークンがなく
		// reader として処理が完結していれば
		if(paren_level == 0 && tok.length == 0){
			let t = tokens
			tokens = []	// 処理用のバッファをクリアし
			return make_s_expr(t)	// この時点でのtokens の内容をS式オブジェクトにして返す
		}
		// 情報が足りず、reader のしごとが中途半端な状態であれば
		// 意味のあるものは返さない
		else{
			return
		}
	}

	let c = input_str[0]
	switch(c){
		// DELIMITER1: White Space Characters
		case " ":
		case "\t":
		case "\n":
			_finish_token()
			break
		// DELIMITER2: parenthesis ()
		case ")":
			_finish_token()
			paren_level--
			tokens.push(')')
			break
		case "(":
			_finish_token()
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
	return reader(input_str.slice(1))
}

// トークン完成
function _finish_token(): void {
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

// 読み取ったトークンをS式に変換
function make_s_expr(tokens:Array<string>): s_expr {
	return array2cons( unflatten(tokens) ) as Cons
}

// S式になる多次元配列の型 ["123"["A","B"["C"]]] ←文字列の配列の入れ子
// 型の入れ子表現ができるのか試してみた。これでよさそうだ。
type t_stack = Array<string|t_stack>
let stack: t_stack = [[]]

function unflatten(flat_list:Array<string>, level:number = 0): t_stack|string {

	if(flat_list.length === 0){
		const ret = stack[0][0] as string
		stack = [[]]
		return ret
	}

	let token = (flat_list.shift() as string)

	if(token == "("){
		const newlevel = level + 1
		stack[newlevel] = new Array()
		return unflatten(flat_list,newlevel)
	}
	else if(token == ")"){
		const baked = stack[level]
		delete stack[level]
		const newlevel = level - 1

		let a = stack[newlevel] as Array<any>
		a.push(baked)
		return unflatten(flat_list,newlevel)
	}
	// when ATOM
	else{
		(stack[level] as Array<any>).push(token)
		return unflatten(flat_list,level)
	}
}

type t_cons_store = Array<Cons|t_cons_store>

function array2cons( arr:t_stack|string ):Cons|null|string {
	if (typeof arr === "string") return arr

	if (arr.length === 0) return null

	let cons_store:t_cons_store = []
	for (const obj of arr) {
		if (obj.constructor.name === "Array"){
			let list = new Cons( array2cons(obj) as Cons|null, null )
			cons_store.push( list )
		}
		else{
			// 1. アトムに出会ったらcons を作っておいて(この段階ではcdr 部がNILで未完成)
			cons_store.push( new Cons(obj as string, null) )
		}
	}

	// 2. 最後にcons を巡回してcdr を接続し、cons を完成させる
	for( let i = 0 ; i < cons_store.length-1 ; i++ ){
		(cons_store[i] as Cons).cdr = cons_store[i+1] as Cons
	}
	return (cons_store[0] as Cons)
}


console.debug( reader("(a)") )		// Cons( 1 . NIL )
/*
console.debug( reader("()") )		// NIL
console.debug( reader("(())") )		// (NIL . NIL) as (NIL)
console.debug( reader("(1)") )		// Cons( 1 . NIL )
console.debug( reader("(1 2)") )	// Cons( 1 . Cons( 2 . NIL ))
console.log( reader( "(()(123)(456))"))
console.log( reader( "(()(1 2 3)(456))"))
*/
