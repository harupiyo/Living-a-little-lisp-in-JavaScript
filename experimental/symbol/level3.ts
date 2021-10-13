// というより、これ、reader 側で判断するべきだと思う。
// というわけでボツ
export function symbol_disignator_p(str:string):"ボツ" {
/*
識別子がシンボルを指すかどうかを調べる

シンボルと認識する識別子は何かな？
→Symbol Disignator という言葉はHyperSpec では使われていない。(用語集にない)
 
http://www.lispworks.com/documentation/lw50/CLHS/Body/f_symbol.htm
 	(symbolp 'elephant) =>  true
 	(symbolp 12) =>  false
 	(symbolp nil) =>  true
 	(symbolp '()) =>  true
 	(symbolp :test) =>  true
 	(symbolp "hello") =>  false

http://www.lispworks.com/documentation/lw50/CLHS/Body/t_symbol.htm
 	Name
 	
 	    The name of a symbol is a string used to identify the symbol. 

→結局どこに書かれているかがわかっていない

経験的に考えてみる

NG な文字を調べたほうが早いかも.
キーボードにある記号を網羅的に調べてみる。

	1. READ にとって特別な文字
		- '
	   	- `
	   	- ,	準クォート(`)の中で展開を指示する記号
		- #
	   	- |
	   	- \
		- ()
		- "	文字列リテラル開始・終了
	   	- :	キーワードシンボル
	   	- ;	コメント
	    - 空白文字
	   		- スペース
			- 改行
			- タブ
	2. package システムで使う文字
   		- :
	   ただし、
	   	package:symbol
	   	package::symbol
	   という形で中間に一度だけ: か:: があれば正当

OK な文字
	上記以外。
	1文字目に数字もOK!えーっ！これはすごい
		(defparameter 1234test 'hello)
	ただし、数字だけで構成されている場合はNG(もちろん)
		(defparameter 1 'hello)
			SIMPLE-ERROR: The NAME argument to DEFPARAMETER, 1, is not a symbol.

TODO 日本語等のUnicode 文字も使えるが、今考えるのは適切でないと思う. 後回し.

RegExp で表現する
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/RegExp

[A-Za-z0-9!@$%^&*-_=+~[]{};?/
*/
	return "ボツ";
}

