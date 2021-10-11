/*
Lisp's value have "type information" at tag.

1		=> [INT: 1]
t		=> [SYMBOL: ]-> [symbol-value: t,...] SYMBOL SYSTEM
nil		=>
"str"	=> [STRING: ]-> ['s,'t,'r,'i,'n,'g,'漢]

*/

export class Value {
	constructor(type,val){
		this.tag = type;
		this.val = val;
	}
}

let i = new Value("INT",1);
console.log(i);
