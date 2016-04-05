var _ = require('underscore');
var Fraction = require('fractional').Fraction
var NumberTheory = require('number-theory');
var Lazy = require('lazy.js')

const P = [2,3,5,7,11,13,17,19,23,29];




var D = [];


Lazy.range(1000)
  .async()
  .each(addValue)
  .onComplete(function(){
  	var fs = require('fs');
	  fs.writeFile("out3.json", JSON.stringify(D), function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	}); 
  });

  var PrimesUntil = 0;
  function addValue(k){
  		console.log(k)
  		var X = {};
  		var F = NumberTheory.factor(k);
  		X['$k'] = k;
      X["$k_2"] = (k).toString(2);
      X['dr_16'] = dr_16(k);
  		PrimesUntil += (X['$p'] = NumberTheory.isPrime(k)|0);

      X['p+1 $p'] = NumberTheory.isPrime(k+1);
      X['p-1 $p'] = NumberTheory.isPrime(k-1);
      // X['p+3 $p'] = NumberTheory.isPrime(k+3);
      // X['p-3 $p'] = NumberTheory.isPrime(k-3);
      // X['p+5 $p'] = NumberTheory.isPrime(k+5);
      // X['p-5 $p'] = NumberTheory.isPrime(k-5);
      // X['p+7 $p'] = NumberTheory.isPrime(k+7);
      // X['p-7 $p'] = NumberTheory.isPrime(k-7);
      // X['p+11 $p'] = NumberTheory.isPrime(k+11);
      // X['p-11 $p'] = NumberTheory.isPrime(k-11);

      // X['p+13 $p'] = NumberTheory.isPrime(k+13);
      // X['p-13 $p'] = NumberTheory.isPrime(k-13);

  	  //['π'] = PrimesUntil;
      //X['π|k'] = PrimesUntil/k;

  		//X['class-prime'] 	= _(F).pluck('prime').sort().join("-")
  		//\sssX['class-power'] 	= _(F).pluck('power').sort().join("-")
      X['first-digit'] = _.last((k).toString())

      X['digital-root'] = digital_root(k);
 
      //X['odd-even-key'] = odd_even_key(k);
      //X['p||c'] = prime_or_composite(k);
      //X['X|d..'] = div_each_digit(k);
     // X['dr X|d'] = digital_root(parseFloat(new String(X['X|d..']).replace('.','')));
      //X['pc,oe'] = prime_or_composite_odd_even(k);
      //X['><'] = gt_or_lt(k);
      X['P'] = 1;
      _.each(F,function(factor){

        X['P'] *= (Math.pow(factor.prime,factor.power+1)-1)/(factor.prime-1);
      })
      _.each(F,function(factor){
  			X = _.clone(X);
  			X['power'] = factor.power;
  			X['prime'] = factor.prime;
  			//console.log(X)
        X['Pnum'] = new Fraction(Math.pow(factor.prime,factor.power)/k).numerator;
        X['Pdem'] = new Fraction(Math.pow(factor.prime,factor.power)/k).denominator;
        X['P/d'] = [X['P']/k].join('/');



        _.each(X["$k_2"].split(""),function(a,b){
            b = X["$k_2"].length-b;
            const TRIG = parseInt(a) ? pascal(b-1) : [ ];
            const SQRT = Math.sqrt(Math.pow(2,b-1));

            X['pascal']  = ['-',Math.pow(2,b-1),TRIG].join(':');
            X['sqrt in Z'] = parseInt(a) && (SQRT == parseInt(SQRT));
            D.push(X);
      
          })
  		})
  }
function digital_root(n) {
    return n - 9*Math.floor((n-1)/9);
}
function digital_root12(n) {
    return n - 12*Math.floor((n-1)/12);
}
function odd_even_key(n) {
    var S = "";
    _.each(new String(n).split(""),function(char){
      var x = parseInt(char);
      if(x % 2 == 0) {S += "e"} else {S += "o"};
    })
    return S;
}
function prime_factors(n){
    var factors = []
    var d = 2
    while( n > 1){
        while( n % d == 0){
            factors.push(d)
            n /= d
        }
        d = d + 1
        if (d*d > n){
            if (n > 1) factors.push(n)
            break
        }
    }
    return factors
  }
function pascal(n) {
    var line = [1];
    for(var k=0;k<n;k++) {
      line.push(line[k] *(n-k)/(k+1));
    }
    return line;
}
function div_each_digit(n) {
  var S = new String(n).split("");
  var X = 1;
  _.each(S,function(s){
    X += Math.sqrt(parseFloat(s));
  });
  return X; 
}
function prime_or_composite(n) {
  var S = new String(n).split("");
  var p_or_c = [];
  _.each(S,function(s){
    var key = NumberTheory.isPrime(parseFloat(s)) ? 'p' : 'c';
    p_or_c.push(key)
  });

  return p_or_c.join("");
}

function prime_or_composite_odd_even(n) {
  var S = new String(n).split("");
  var p_or_c = [];
  _.each(S,function(s){
    var k = parseFloat(s);
    var key = [(NumberTheory.isPrime(k) ? 'p' : 'c'), (k%2 == 0 ? 'e' : 'o' )].join(':');
   
    p_or_c.push(key)
  });

  return p_or_c.join("-");
}
function gt_or_lt(n){
  var S = new String(n).split("");
  var gt_or_lt_list = [];
  var last = null;
  _.each(S,function(s){
    var k = parseInt(s);
    if(last === null) {
      gt_or_lt_list.push("*");
    } else if(last == k) {
      gt_or_lt_list.push('=');
    } else if(last > k) {
      gt_or_lt_list.push('>');
    } else if(last < k) {
      gt_or_lt_list.push('<');
    }
    last = k;

  });
  return gt_or_lt_list.join("");
}
function dr_16(n) {
  var k = (n).toString(16);
  var Sum = 0;
  var S = _.each(k.split(""),function(i){
    Sum += parseInt(i,16);
  })
  return Sum;
}