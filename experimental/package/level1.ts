/*
パッケージ

SYMBOL はJavaScript 側ではオブジェクトだが、
Lisp からはシンボル名で辞書引きできなければいけない。
それをハッシュテーブルで表現する。

そのハッシュテーブルはパッケージ側で管理している。


JavaScript ではハッシュテーブルはオブジェクトである。
https://qiita.com/katsukii/items/168bee174073ae7ec7e4
https://www.typescriptlang.org/docs/handbook/2/everyday-types.html

http://clhs.lisp.se/Body/f_intern.htm
*/

import { Value } from '../value/level2.js'
import { Symbol } from '../symbol/level1.ts'

interface SymbolDictionary {
	[name :string] :Symbol
}

/* test TypeScript
let sd :SymbolDictionary = {}
sd["foo"] = new Value("INT",1)
console.log(sd)
*/

type InternStatus = ":internal" | ":external" | ":inherited" | "nil"

class Package {
	name :string
	nickname :string
	use_list :Array<any>
	shadow_list :Array<any>
	internal_symbols :SymbolDictionary
	external_symbols :SymbolDictionary
	inherited_symbols :SymbolDictionary

	constructor(name:string, use:Array<any>){
		this.internal_symbols = {}
		this.external_symbols = {}
		this.inherited_symbols = {}
		this.name = name
		this.nickname = name
		this.use_list = use
		this.shadow_list = []
	}

	intern(name:string) {
		if( this.external_symbols.hasOwnProperty(name) ){
			return [this.external_symbols[name], ":external"]
		}
		else if( this.inherited_symbols.hasOwnProperty(name) ){
			return [this.inherited_symbols[name], ":inherited"]
		}
		else if( this.internal_symbols.hasOwnProperty(name) ){
			return [this.internal_symbols[name], ":internal"]
		}
		else{
			let s = new Symbol(name)
			console.log("make new symbol and intern it. シンボルを作ってインターンしました.")
			this.internal_symbols[name] = s
			return [s, "NIL"]
		}
	}
}

let p1 = new Package("foo",["COMMON-LISP"])
console.log(p1)

console.log( p1.intern("bar") ) // new
console.log( p1.intern("bar") ) // already exists
