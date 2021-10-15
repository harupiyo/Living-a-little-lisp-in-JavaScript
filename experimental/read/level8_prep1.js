/*
ううむ、一次元のflat な構造を、入れ子のリストにするやり方が思いつかない！
アルゴリズムを知る必要があるのだが、自分で泥臭くやる魅力も捨てがたい。

分析してみる。
	(に出会ったら
		直後が) で閉じる場合
		新たな( が始まる場合
		ATOM が来る場合
	)に出会ったら
		完成したリストを吐き出す
	ATOM に出会ったら
		過去に( があれば
			リストの続き
	
スタック構造を用意すればよさそうだ

	STACK[2]        (3)
	STACK[1]  () (2     4)
	STACK[0] (  1          5)

	( を見つけたらSTACK のレベルを上がる
	ATOM を見つけたら現在のレベルのスタックにpush
   	) を見つけたらそのSTACK で作成中のリストを完成させてスタックを開始させた場所に挿入する
*/

let stack = [[]]

// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/Default_parameters
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
		console.log("up",stack)
		return unflatten(list,newlevel)
	}
	else if(token == ')'){
		const baked = stack[level]
		delete stack[level]
		const newlevel = level - 1
		stack[newlevel].push(baked)
		console.log("down",stack)
		return unflatten(list,newlevel)
	}
	// when ATOM
	else{
		stack[level].push(token)
		console.log("atom",stack)
		return unflatten(list,level)
	}
}

// console.log( unflatten( [ "123" ] ))
// console.log( unflatten( [ "(", ")" ] ))
// console.log( unflatten( [ "(", "(", ")", ")" ] ))

// いいね、できたようだ
console.log( unflatten( [ "(", "(", ")", "(", "123", ")", "(", "456", ")", ")" ] ))

