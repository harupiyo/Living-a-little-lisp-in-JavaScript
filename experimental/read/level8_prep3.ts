/*
level8.ts 側に移動する前に、TypeScript で記述しなおして整理する
*/

import { Cons } from '../cons/level2.ts'
import { Value } from '../value/level2.js'

type t_stack = Array<string|t_stack>
let stack: t_stack = [[]]

function unflatten(flat_list:Array<string>, level:number = 0): t_stack|string {

	if(flat_list.length === 0){
		const ret = stack[0][0] as string
		stack = [[]]
		return ret
	}

	let token:string|undefined = flat_list.shift()	// flat_list は空でなない
	if(token === undefined) throw ("[TODO] 万一にも起こりえない不具合. TypeScript の型対策のためだけのコード");

	if(token == "("){
		const newlevel = level + 1
		stack[newlevel] = new Array()
		return unflatten(flat_list,newlevel)
	}
	else if(token == ")"){
		const baked = stack[level]
		delete stack[level]
		const newlevel = level - 1
			/*
			const newlevel = level - 1
			この場所で、なぜかエラー。
			error: TS7022 [ERROR]: 'newlevel' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
					const newlevel = 0
						  ~~~~~~~~
				at file:///home/harupiyo/Living-a-little-lisp-in-JavaScript/experimental/read/level8_prep3.ts:31:9

			TS2349 [ERROR]: This expression is not callable.
			  Type 'Number' has no call signatures.
					const newlevel = 0
									 ^
			このエラーは、一般的なこれまでの私の経験と異なり、その上との関係で起こるエラーではなく、
			その次の来るコードとの関係で起こるエラーだった。
			その次に
					((stack[newlevel]) as Array<Array<any>>).push(baked)
			を書かない限り、このエラーは出ない。

			そして、この火種となったコードはまだあやふやな知識の元で書かれている段階であった。
			その部分をそれ自身がエラーにならないように書き直すことで
					let a = stack[newlevel] as Array<any>
					a.push(baked)
			無事エラーが出なくなった。
			*/

		let a = stack[newlevel] as Array<any>
		a.push(baked)
			/*
			もともとJavaScript ではこう書いていたが、
				stack[newlevel].push(baked)

			TypeScript では型エラーが起こる。
				error: TS2339 [ERROR]: Property 'push' does not exist on type 'string | t_stack'.
				  Property 'push' does not exist on type 'string'.
						stack[newlevel].push(baked)
			この文脈ではstack[newlevel] は配列であるのだが、stack の型は t_stack であり、その要素がstring であってもいい。
			だが、プログラマとしてはここでは配列として操作をしたいので、どうしたらいいのだろうか。
			1. 型を強制する方法がないか？型キャストのような
				https://qiita.com/querykuma/items/e7667adba1477eb7d3a5

					as を使え:
						let a = stack[newlevel] as Array<any>
						a.push(baked)
						↓一行で書くとこう
						(stack[newlevel] as Array<any>).push(baked)

			2. もともとの型指定をもっと厳密にやる方法がないか？
		   		TODO

			愚痴:
			型の世界は、そもそもはプログラマーが自分で型を指定しているくせに
		   	TypeScript に型の誤りを指摘されそうか！とハッとする光の面も
			大いにあるが、

			一方では文脈によってこの場合はArrayとして、この場合はstring として
		   	使い分けている場所でいらぬ型の間違いを指摘されてしまう。

		   	プログラマーはそのつもりで書いているのでプログラマーの頭の中では
		   	正しいのだが（実行結果＝セマンティックも正しい）、
			型の意味論ではそれとは異なる意味(文字通りの意味)を持つことになる。

		   	プログラム言語は思ったように動くのではなく、書いたとおりに動くのだ
		   	という格言があるが、今、まさにその時の渋い感情を味わっている。

		   	そういった時に、型の言葉で正しく語りかけてあげないといけない.

		   	JavaScriptではいらぬコミュニケーションを強いられる場面があって、
		   	また型の言葉に慣れていないためもあって
			気疲れする。これがいわゆる"型苦しい"。
			*/
			/*
			この２行
				let a = stack[newlevel] as Array<any>
				a.push(baked)
		    をこのようにも書けたらいいんだけど、const newlevel = level - 1
		   	の方でエラーになってしまう。
				(stack[newlevel] as Array<any>).push(baked)
			*/
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

// ( V >) (V >) (V NIL)
//  123    NIL  (V>) (V NIL)
//               A    B
// console.log( array2cons(["123", [], ["A","B"]]) )
	// よーし、この形にできた


// console.log( array2cons( unflatten( [ "123" ] )) )	; 123
// console.log( array2cons( unflatten( [ "(", ")" ] )))	; null
// console.log( array2cons( unflatten( [ "(", "(", ")", ")" ] ))) // Cons { car: null, cdr: null }

// こうなるはずだ
// (V >) (V >)  (V NIL)
// NIL   (V NIL)(V NIL)
//       123    456
//console.log( array2cons( unflatten( [ "(", "(", ")", "(", "123", ")", "(", "456", ")", ")" ] )))
/*
Cons {
  car: null,
  cdr: Cons {
    car: Cons { car: "123", cdr: null },
    cdr: Cons { car: Cons { car: "456", cdr: null }, cdr: null }
  }
}
よし、できている。
*/
