/*
level1.js で明らかになった問題を解決する

以下引用:
	PART I:
		let c3 = new Cons(1,2);
		c3.cdr = c3.car;				// cdr とcar が同じオブジェクトの参照を指しているので
		console.log(c3);
		c3.car.val = "it changed";		// どちらかを変えれば
		console.log(c3);				// 両方変わる

		Cons {
		  car: Value { tag: "TODO", val: "it changed" },
		  cdr: Value { tag: "TODO", val: "it changed" }
		}
		できているね

	PART II:
		Lisp は違う動きをしている😁
			CL-USER(2): (defparameter a 1)
			A
			CL-USER(3): (defparameter b 2)
			B
			CL-USER(4): (defparameter c (cons a b))
			C
			CL-USER(5): (rplacd c (car c))
			(1 . 1)
			CL-USER(6): (setq a 3)
			3
			CL-USER(7): c
			(1 . 2)

		(cons a b) を評価する際に、リーダーがシンボルを評価し値に置き換えて
		(cons 1 2) にした状態でEVAL に渡すから、cons にシンボルを格納しているわけじゃない。
		したがって6行目でシンボルa に新しい値を割り当ててもcons にはなんの関係もない。

		次にこのようにしてみると
			CL-USER(7): c
			(1 . 2)
			CL-USER(11): (rplacd c (car c))
			(1 . 1)
			CL-USER(12): (rplaca c 3)
			(3 . 1)
		car 部(1 をさす)は確かにポインターだが、rplaca で新しい値3 に書き換える際、新しい値3を作ってそのポインターに差し替えるわけだから、1の中身をいじっているわけじゃない。

		こうすると初めて循環参照になる。
			CL-USER(13): (rplacd c c)
			3 3 3 3 3 3 ...^c

		なるほど。

		この部分を考えないといけない。

改めて考えるに、
	"car 部(1 をさす)は確かにポインターだが、rplaca で新しい値3 に書き換える際、新しい値3を作ってそのポインターに差し替えるわけだから、値1の中身をいじっているわけじゃない。"
は正しく、この場合rplaca/rplacd の操作によって参照されなくなった値はCG 回収の対象になるだろう。
値1 のポインターを陽に扱えないため、値１のポインターの先、値そのものを修正する手段がない。
だからLisp の値はJavaScript でいうconst だ。

よってPART I部とPART II部の考察は矛盾しておらず、どちらも正しい。
そしてPART I部では陽に"値の参照"を代入したが、Lisp ではそのようなことはできない。
できるとしたらCons オブジェクトの参照を扱う
	CL-USER(13): (rplacd c c)
	3 3 3 3 3 3 ...^C
という場合だ。

結論:
	level1.js で疑問視したこの話題はLispではありえないケースをテストしたからいけないのであって、Cons 実装の欠点があぶり出されたわけではなかった。

*/

import { Value } from "../value/level2.js"
import { LSymbol } from '../symbol/level2.ts'

declare type atom = string | number | LSymbol | Value | null	// null as NIL
declare type s_expr = atom | Cons
export type cons_pointer = s_expr

export class Cons {
	car: cons_pointer
	cdr: cons_pointer
	constructor(car:cons_pointer,cdr:cons_pointer){
		this.car = car
		this.cdr = cdr
	}
}

/*
let c1 = new Cons( new Value("INT", 1), new Value("INT", 2) );
console.log(c1);

let c2 = new Cons(
	new Cons(new Value("INT", 1), new Value("INT", 2)),
	new Cons(new Value("INT", 3), new Value("INT", 4)));
console.log(c2);

// 巡回リスト
let c4 = new Cons( new Value("INT", 1), new Value("INT", 2) );
c4.cdr = c4;
console.log(c4)
// => Cons { car: Value { tag: { type: "INT", constant: false }, val: 1 }, cdr: [Circular] }
// できているね
*/
