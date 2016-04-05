var _ = require('underscore');
var Fraction = require('fractional').Fraction
var NumberTheory = require('number-theory');
var Lazy = require('lazy.js')
var jStat = require('jstat').jStat;
var mathjs = require('mathjs');
var bigInt = require("big-integer");

_.times(100,function(k) {
	if(k <= 10)
		return;
	var sqrtK = Math.sqrt(k);
	var primesUntilSqrt = get_primes_until(sqrtK);
	var a = jStat.product(primesUntilSqrt);
	var P = bigInt(a).pow(k-1).toJSNumber() ; //Math.pow(a,( k-1)) ;
	var Q = k* Math.floor(P/ k);
	var result = P - Q -1
	//var result = mathjs.eval(expr)

	console.log('for',k,primesUntilSqrt,'=',P,'-',Q,'=',result);

})
function get_primes_until(n) {
	//console.log(n)
	var Out = [];
	_.times(Math.round(n),function(k){
		if(NumberTheory.isPrime(k))
			Out.push(k);
	})
	return Out;
}