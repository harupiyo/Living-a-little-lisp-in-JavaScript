/*
level8_prep1.js によってunflatten(トークンのストリーム）から入れ子になった配列が手に入るようになったので、
更にこれを CONS 構造に置き換えていく array2cons を作る
*/

let stack = [[]]

function unflatten(list,level = 0){
	if(list.length === 0){
		const ret = stack[0][0]
		stack = [[]]
		return ret
	}

	let token = list.shift()
	if(token == '('){
		const newlevel = level + 1
		stack[newlevel] = new Array()
		return unflatten(list,newlevel)
	}
	else if(token == ')'){
		const baked = stack[level]
		delete stack[level]
		const newlevel = level - 1
		stack[newlevel].push(baked)
		return unflatten(list,newlevel)
	}
	// when ATOM
	else{
		stack[level].push(token)
		return unflatten(list,level)
	}
}

class Cons {
	constructor(car,cdr){
		this.car = car
		this.cdr = cdr
	}
}

function array2cons(arr){
	if (typeof arr === "string") return arr

	let cons_store = []
	if (arr.length === 0) return null
	for (const obj of arr) {
		if (obj.constructor.name === "Array"){
			let list = new Cons(array2cons(obj), null)
			cons_store.push(list)
		}
		else{
			cons_store.push( new Cons(obj,null) )	// 1. アトムに出会ったらcons を作っておいて
		}
	}
	// 2. 最後にcons を巡回してcdr を接続して回る
	for(let i=0; i<cons_store.length-1 ; i++){
		cons_store[i].cdr = cons_store[i+1]
	}
	return cons_store[0]
}

// ( V >) (V >) (V NIL)
//  123    NIL  (V>) (V NIL)
//               A    B
// console.log( array2cons(["123", [], ["A","B"]]) )
	// よーし、この形にできた


// console.log( array2cons( unflatten( [ "123" ] )) )	; 123
// console.log( array2cons( unflatten( [ "(", ")" ] )))	; null
// console.log( array2cons( unflatten( [ "(", "(", ")", ")" ] ))) 
	// Cons { car: null, cdr: null }

// こうなるはずだ
// (V >) (V >)  (V NIL)
// NIL   (V NIL)(V NIL)
//       123    456
console.log( array2cons( unflatten( [ "(", "(", ")", "(", "123", ")", "(", "456", ")", ")" ] )))
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
