/*
パッケージ指定子をサポート

Package designator = String designator | Package Object
String designator = "name" | "nickname"
http://clhs.lisp.se/Body/26_glo_p.htm#package_designator

MEMO パッケージが複数ファイルにまたがることができる性質は、TypeScript のNamespaceのマージ機能に似ている
https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-namespaces
*/

// MEMO class Package はこのソース中のあとに出てくるが、この場所で前方参照できる
// MEMO 指示子のTypeScript 記述は
//	https://www.typescriptlang.org/docs/handbook/utility-types.html#thistypetype
//	を参考に改良の余地がある
type Package_designator = string | Package | null

/* test for TypeScript
let p :Package_designator = "hello"
console.log(p)
p = null
console.log(p)
*/


import { Value } from '../value/level2.js'
import { Symbol } from '../symbol/level1.ts'

interface SymbolDictionary {
	[name :string] :Symbol
}

class Package {
	name :string
	nickname :string
	use_list :Array<Package_designator>
	shadow_list :Array<any>
	internal_symbols :SymbolDictionary
	external_symbols :SymbolDictionary
	inherited_symbols :SymbolDictionary

	constructor(name:string, use:Array<Package_designator>){
		this.internal_symbols = {}
		this.external_symbols = {}
		this.inherited_symbols = {}
		this.name = name
		this.nickname = name
		this.use_list = use
		this.shadow_list = []
		this.use(use)
	}

	// http://clhs.lisp.se/Body/f_use_pk.htm
	use(ps:Array<Package_designator>){
		ps.forEach((p:any) => {	// TODO 型any よりも適切にしたい.(any がないとエラー)
								// ここでp はPackage_designator だから、
								// (find-package p) で Package 型を返すようにすればいいかな
								// find-package は全パッケージを管理するグローバル変数を作り、それを見て判断するようにする
			if(p !== null){
				if(p.hasOwnProperty("external_symbols")){
					for (const key in p.external_symbols) {
						if(this.inherited_symbols.hasOwnProperty(key)){
							throw("すでにこのシンボルは継承済みです")
						}else{
							console.debug("シンボルを継承しました")
							this.inherited_symbols[key] = p.external_symbols[key]
						}
					}
				}
			}
		})
	}

	intern(name:string):[Symbol,string] {
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
			console.debug("make new symbol and intern it. シンボルを作ってインターンしました.")
			this.internal_symbols[name] = s
			return [s, "NIL"]
		}
	}

	export(name:string) :"t" {
		if( this.internal_symbols.hasOwnProperty(name) ){
			this.external_symbols[name] = this.internal_symbols[name]
			// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/delete
			delete this.internal_symbols[name]
		}
		else if( this.inherited_symbols.hasOwnProperty(name) ){
			this.external_symbols[name] = this.inherited_symbols[name]
		}
		else{
			let s = new Symbol(name)
			console.debug("make new symbol and intern it. シンボルを作ってエクスポートしました.")
			this.external_symbols[name] = s
		}
		return "t"
	}
}

/*
let p0 = new Package("COMMON-LISP", [null])
let [s0,ret] = p0.intern("MACHINE-TYPE")
console.log(ret)
console.log(s0)
  
   こっちは symbol_value() できるのに
let s1 = new Symbol("test")
s1.symbol_value(new Value("INT",1))
console.log(s1)

こっちはできない 
s0.symbol_value(new Value("INT",1))

error: TS2339 [ERROR]: Property 'symbol_value' does not exist on type 'string | Symbol'.
  Property 'symbol_value' does not exist on type 'string'.
s0.symbol_value(new Value("INT",1))


	intern(name:string) {
   	↓こうすれば問題解決した.(この場所に返り値の型が書けるのか)
	intern(name:string):[Symbol,string] {
*/

// USE-PACKAGE する大元のパッケージを作り、外部シンボルを作る
let p0 = new Package("COMMON-LISP", [null])
let [s0,ret] = p0.intern("MACHINE-TYPE")
s0.symbol_value( new Value("STRING", "inside JavaScript") )
p0.export("MACHINE-TYPE")
console.log(s0)

// それを新しいパッケージでUSE した時に、シンボルが存在するかを調べる
let p1 = new Package("foo",[p0])
console.log( p1.intern("MACHINE-TYPE") ) // :inherited
