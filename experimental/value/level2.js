/*
- 定数の表現
- スペシャル変数
	- これはシンボル側で管理しているかな？

*/

export class Value {
	constructor(type,val){
		this.tag = {
			type: type,
			constant: false,
		}
		this.val = val;
	}
	set(new_type,new_value){
		if (this.tag.constant) {
			throw("[TODO] The SYMBOL is a constant and thus can't be set.")
				// ↑にシンボル名を入れたい。ということはここではエラーを報知するだけにするか、定数かどうかをシンボル側に持たせるかのどちらかだ。
		}
		this.tag.type = new_type
		this.val = new_value
	}
}

export function make_constant( value_obj ){
	value_obj.tag.constant = true
}


/*
let v = new Value("INT",1)
console.log(v)

v.set("INT",10)
console.log(v)

make_constant(v)

try {
	v.set("INT",100)
	console.log(v)
}catch(e){
	console.log(e)
}
*/
