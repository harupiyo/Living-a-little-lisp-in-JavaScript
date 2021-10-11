/*
cons is ?

cons は値だが、Lisp で最重要のデータ構造なので値システムとは別管理とする。
値システムはValue の方でタグ付きオブジェクトとして実装する。

	(pointer-car . pointer-cdr)

	let c = new Cons(car,cdr);
	c.car(); => reference of CAR "NOT A VALUE"
	c.cdr(); => reference of CDR "NOT A VALUE"

	c.car(new Cons());

	c.cdr( c.car() );	circular list

	new Cons( new Cons(1,2), new Cons( 3, new Cons(4,5)))
		=> ((1 . 2) . (3  . (4 . 5)))
		=> ((1 . 2) 3 4 . 5))
	new Cons( new Cons( 1, new Cons(2, "nil"), new Cons( 3, new Cons(4, new Cons (5, "nil")))
		=> ((1 . (2 . nil)) . (3 . (4 . (5 . nil))))
		=> ((1 2) 3 4 5)
	new Cons( 1, "nil");	=> (1 . nil) == (1)

CL-USER(1): (cons 1 2)
(1 . 2)
CL-USER(2): (cons 1 (cons 2 3))
(1 2 . 3)
CL-USER(3): (cons (cons 1 2) (cons 3 (cons 4 5)))
((1 . 2) 3 4 . 5)
CL-USER(4): (cons (cons 1 (cons 2 nil)) (cons 3 (cons 4 (cons 5 nil))))
((1 2) 3 4 5)

(cons 1 nil) => (1)
(cons nil nil) => (nil)

*/

class Cons {
	constructor(car,cdr){
		/*
		car部、cdr部には値ではなくポインターを入れたい。
		JavaScript ではオブジェクトの場合のみポインターになるので、
		car, cdr は(プリミティブ値ではなく)オブジェクトである必要がある。
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/typeof

		正式にはcar, cdr にくるのはオブジェクトのポインターである必要があるが、
		スケッチとしてこの場所でオブジェクトに変換して格納しておく。
		*/
		this.car = ("object" != typeof car) ? new Value("TODO",car) : car
		this.cdr = ("object" != typeof cdr) ? new Value("TODO",cdr) : cdr
	}
}

let c1 = new Cons(1,2);
console.log(c1);

let c2 = new Cons( new Cons(1,2), new Cons(3,4));
console.log(c2);

let c3 = new Cons(1,2);
c3.cdr = c3.car;				// cdr とcar が同じオブジェクトの参照を指しているので
console.log(c3);
c3.car.val = "it changed";		// どちらかを変えれば
console.log(c3);				// 両方変わる
/*
Cons {
  car: Value { tag: "TODO", val: "it changed" },
  cdr: Value { tag: "TODO", val: "it changed" }
}
できているね

Lisp は違う動きをしている😁
	(let ((c (cons 1 2)))
	  (rplacd c (car c))
	  (rplaca c 2)
	  c)

	(2 . 1)
	
Lisp を学んでいた時には考えもしなかった話題だなー。
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

TODO この部分を考えないといけない。
*/

// 巡回リスト
let c4 = new Cons(1,2);
c4.cdr = c4;
console.log(c4)
// => Cons { car: Value { tag: "TODO", val: 1 }, cdr: [Circular] }
// できているね

/*
cons with LISPish VALUE
*/

import {Value} from "../value/level1.js"

let c5 = new Cons(new Value("INT",1), new Value("CONSTANT","NIL"))
console.log(c5);


