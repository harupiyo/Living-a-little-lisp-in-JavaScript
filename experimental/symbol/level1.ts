/*

http://www.lispworks.com/documentation/lw50/CLHS/Body/t_symbol.htm#symbol

SYMBOL is OBJECT.
There are some SLOTs:
- name
- package
- property list(plist)
- value
- function

ひとまず値をvalue スロットに設定できるところまで作る
function にはどういう形で入れるべきか決めきれていない。Javascript 側の無名関数か、Lisp のlambda か。
どこまでホスト側言語で、どこからゲスト側言語で実装すべきかには自由があるが、その問題点が明確になるまでは好きに実装することにする。
たぶん今の段階で理由を説明されても腹落ちしないであろうから。
*/

import { Value } from '../value/level2.js';

const UNBOUND: Value = new Value("unbound", "unbound")

export class Symbol {
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
	symbol_value(value_object :Value){
		this.value = value_object
		return value_object
	}
}

// new symbole
var s1 = new Symbol("FOO")
console.log(s1)

// set value-slog and it's return value.
console.log( s1.symbol_value( new Value("INT",3) ) )

// symbol after set value
console.log(s1)

