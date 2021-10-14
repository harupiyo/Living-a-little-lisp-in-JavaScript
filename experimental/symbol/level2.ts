/*
1. SYMBOL_VALUE の見直しと SET の実装
2. LSymbol がECMAScript のプリミティブ型と名前がバッティングするのでリネーム
*/

import { Value } from '../value/level2.js';

const UNBOUND: Value = new Value("unbound", "unbound")

export class LSymbol {
	name: string
	package: string
	plist: Value
	value: Value
	function: object
	constructor(name :string){
		this.name = name
		this.package = "COMMON-LISP-USER"
		this.plist = new Value('NIL','NIL')
		this.value = UNBOUND
		this.function = UNBOUND
	}

	// SYMBOL-VALUE を誤解しているのに気づく
	// http://clhs.lisp.se/Body/f_symb_5.htm#symbol-value
	// 値を取得する手段であり、値をセットするのはSET の仕事である
	// http://clhs.lisp.se/Body/f_set.htm#set
	symbol_value(){
		return this.value
	}

	set(value_object :Value){
		this.value = value_object
		return value_object
	}
}

// new symbole
var s1 = new LSymbol("FOO")
console.debug(s1)

// set value-slog and it's return value.
console.debug( s1.set( new Value("INT",3) ) )

// symbol after set value
console.debug(s1)

console.debug(s1.symbol_value())
	// Value { tag: { type: "INT", constant: false }, val: 3 }

