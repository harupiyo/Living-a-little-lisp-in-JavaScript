import { Package } from '../package/level3.ts'
import { LSymbol } from '../symbol/level2.ts'
import { Value } from '../value/level2.js'
import { Cons } from '../cons/level2.ts'
import { reader, s_expr } from '../read/level8.ts'


let p0 = new Package("COMMON-LISP", [null])
let [s0,ret] = p0.intern("MACHINE-TYPE")
s0.set( new Value("STRING", "inside JavaScript") )

const l_package: Package = p0

function l_eval(s_expression: s_expr):any {
	// TODO
}

console.log( reader("1") )

