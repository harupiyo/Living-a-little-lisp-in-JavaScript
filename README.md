# Living-a-little-lisp-in-JavaScript
Learner's implementation of easy LISP language. Try, and Think, and Failure, and Fix!

## 後回しメモ(必要がなければやらないかも)
- Test Runner(Deno test)
	- https://qiita.com/azukiazusa/items/8238c0c68ed525377883#deno%E3%81%AB%E3%82%88%E3%82%8B%E3%83%86%E3%82%B9%E3%83%88
- Type Script の導入

MEMO
read:
	2. (quote) のサポート
	let quoting = true:Boolean	// quote の影響下にあるかどうか

(+ 1 2) が動くようにする


readmacro with readtable
	CL-USER(2): (inspect *readtable*)
	#<STRUCTURE-CLASS COMMON-LISP:READTABLE> at #x000000100001CC40
	   0 BASE-CHAR-SYNTAX-ARRAY -> a vector (128)
	   1 BASE-CHAR-MACRO-ARRAY -> a simple T vector (128)
	   2 EXTENDED-CHAR-TABLE -> #<STRUCTURE-CLASS COMMON-LISP:HASH-TABLE>
	   3 %READTABLE-CASE -> fixnum 0 [#x0000000000000000]
	   4 %READTABLE-STRING-PREFERENCE -> the symbol CHARACTER
	   5 %READTABLE-SYMBOL-PREFERENCE -> the symbol BASE-CHAR
	   6 %READTABLE-NORMALIZATION -> the symbol T

readtable case
http://www.lispworks.com/documentation/lw60/CLHS/Body/23_ab.htm
	modern mode なら :preserve 

nil, t はどのように実現すべきか？
	シンボルではないのかな？
		CL-USER(6): (find-symbol "t")

		NIL
		NIL
		CL-USER(7): (find-symbol "nil")

		NIL
		NIL

	nil の表記方法
		()
		'()
		'nil
		nil

# READ がシンボルをどう扱うかの考察

今、READ はシンボルを見つけたらその値に置き換えるようにした
	しかしこれは大きな誤解だと思う

READ が行うのはシンボル識別子を認識し、その名前のシンボルがなければ新規作成しpackage にintern するというだけだろう。

そのシンボルを覗いて(除き方にはシンボルの置かれる場所に応じて SYMBOL-VALUE, SYMBOL-FUNCTION のあるいはQUOTE を使ったありのままの３種類がある) 値なり関数なりを取り出して、あるいはQUOTE によって記号として使うのは EVAL 側であるはずだ。

http://www.lispworks.com/documentation/lw60/CLHS/Body/f_rd_rd.htm
	'a => (quote A) に変換するだけで、(quote A) をどう扱うかはEVAL 側に託す

READ がなすべき仕事についてはどこに書いてあるのか？
http://www.lispworks.com/documentation/lw60/CLHS/Body/23_a.htm

用語 Lisp Reader:
http://www.lispworks.com/documentation/lw60/CLHS/Body/26_glo_l.htm#lisp_reader
	Lisp reader n. Trad. the procedure that parses character representations of objects from a stream, producing objects. (This procedure is implemented by the function read.) 
   文字からオブジェクトをproduce する

本来ならANSI Common Lisp を参照すべきであるが、
和訳されたドキュメントとしてCltl2 であるCOMMON LISP 第二版 P.499 入出力を参考とし、基礎知識を蓄えておく。
(そうすればANSI Common Lisp も読めるようになるだろう)

- リーダーが扱う文字の種類
	- イリーガル文字
	   	ファイル終端の\ など
   		エラーとして扱う
	- 空白文字
   		<tab> <space> <page> <newline> <return> <linefeed>
	- 要素文字(constituent)
		[ ] { } ? ! $ % & * + - . / 0-9 : < > <backspace> @ A-Z ^ _ a-z ~ <rubout>
   		要素文字は属性を持っている
			- 英字属性
		   	- 数字
			- 桁
		   	- パッケージマーカ :
		   	- イリーガル文字
		   	- 小数点
	- 単一エスケープ文字 \
   		\y であれば y とする(readtable-case には制御されず、そのまま)
	- 多重エスケープ文字 |
	- マクロ文字(リードマクロのことだろう)
   		- 終端マクロ文字
	   		' ( ) , ; `
- 要素文字及びエスケープ文字は、トークンを作るために累積され、次に数あるいはシンボルとして解釈される。

- トークンが組み立てられた時、それをLisp オブジェクトを表現するものとして解釈し、 そのオブジェクトを返す。

22.1.2 数およびシンボルの構文解析

表 22-2: 実際の数の構文 ←必要になったら参照する

# throw(`The variable ${token} is unbound. 変数${token}に値が束縛されていません`)

# const l_package: Package = p0	// MEMO これはpackage 側のファイルで持つべきかな？いや、もっとLisp全体を統括する部分で持つはずだ。今はここでよい。

# REPL に２つのS式を入力したら二行を入力したものとする
	CL-USER(1): 123 456
	123
	CL-USER(2):
	456

# NIL の扱いをどうするか
