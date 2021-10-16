/*
1. find-symbol 実装
2. JavaScript の予約語Symbol の代わりに安全な名前LSymbol へ差し替え

	MEMO
		JavaScript 予約語一覧
		https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Lexical_grammar#reserved_keywords_as_of_ecmascript_2015
			package も予約語かもしれない。

		TypeScript 側の予約語も確認しておかないと
		https://github.com/microsoft/TypeScript/issues/2536
		https://www.typescriptlang.org/docs/handbook/
			うーん、よくわからない。

		TypeScript で予約語を使ってしまったら、TypeScript 側でエラーを出すからそれに頼ればいいかな？

		それにしてもSymbol は怒られなかった。
*/

// MEMO 指示子のTypeScript 記述は
//	https://www.typescriptlang.org/docs/handbook/utility-types.html#thistypetype
//	を参考に改良の余地がある
type Package_designator = string | Package | null

import { Value } from '../value/level2.js'
import { LSymbol } from '../symbol/level2.ts'

interface SymbolDictionary {
	[name :string] :LSymbol
}

export class Package {
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
							throw("Package:すでにこのシンボルは継承済みです")
						}else{
							console.debug("Package:シンボルを継承しました")
							this.inherited_symbols[key] = p.external_symbols[key]
						}
					}
				}
			}
		})
	}

	intern(name:string):[LSymbol,string] {
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
			let s = new LSymbol(name)
			console.debug("Package: make new symbol and intern it. シンボルを作ってインターンしました.")
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
			let s = new LSymbol(name)
			console.debug("Package: make new symbol and intern it. シンボルを作ってエクスポートしました.")
			this.external_symbols[name] = s
		}
		return "t"
	}

	// http://clhs.lisp.se/Body/f_find_s.htm
	find_symbol(name:string): LSymbol|"nil" {
		if( this.internal_symbols.hasOwnProperty(name) ){
			return this.internal_symbols[name];
		}else if( this.inherited_symbols.hasOwnProperty(name) ){
			return this.inherited_symbols[name];
		}else if( this.external_symbols.hasOwnProperty(name) ){
			return this.external_symbols[name];
		}
		return "nil"
	}
}

/*
// USE-PACKAGE する大元のパッケージを作り、外部シンボルを作る
let p0 = new Package("COMMON-LISP", [null])
let [s0,ret] = p0.intern("MACHINE-TYPE")
s0.set( new Value("STRING", "inside JavaScript") )

console.debug( p0.find_symbol("MACHINE-TYPE") )	// LSymbol "MACHINE-TYPE"
*/
