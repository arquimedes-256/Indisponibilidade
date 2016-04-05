var _ = require('underscore');
var NumberTheory = require('number-theory');

const P = [2,3,5,7,11,13,17,19,23,29];

var naviosList 	= ['null','navio1','navio2','navio3','navio4'];
var portosList 	= ['null','p1','p2','p3'];
var vlrList		= ['null',10,20,30,40,50];
var priorityList = ['portosList','naviosList','vlrList'];

//porto -> navios
var T = [
	//t1:
	{
		p1:{navio1:30,navio2:20,navio4:10},
		p2:{navio3:10}
	},
	//t2:
	{
		p1:{navio2:20,navio4:10},
		p2:{navio3:10,navio1:10}
	},
	//t2:
	{
		p1:{navio4:10},
		p2:{navio3:10,navio1:10,navio2:30},
		p3:{navio3:40},
		null:{navio3:40}
	}
]
//prime fact
var F = [];

function compute(priorityList) {
	const nI = priorityList.indexOf('naviosList');
	const pI = priorityList.indexOf('portosList');
	const vI = priorityList.indexOf('vlrList');
	//For each time t in T
	_.each(T,function(t) {
		_.each(t,function(navios,pK){
			console.log(pK);
			_.each(navios,function(vlr,navio) {
				//Let Dimensions
				var nC = Math.pow(P[nI],naviosList.indexOf(navio));
				var pC = Math.pow(P[pI],portosList.indexOf(pK));
				var vC = Math.pow(P[vI],vlrList.indexOf(vlr));
				//Calc Factors
				var nF = NumberTheory.factor(nC);
				var pF = NumberTheory.factor(pC);
				var vF = NumberTheory.factor(vC);

				var key = [nC * pC * vC , ['',s(nF),s(pF),s(vF)].join('; ') ].join(':');
				var node = {}; node[key] = [navio,pK,vlr];

				F.push(node);

				function s(x) { return '('+(x[0] && [x[0].prime , x[0].power].join('^'))+')' };
			})
		})
	});
}
compute(['portosList','naviosList','vlrList']);

console.log(F);


// mult([1,2,3,4],[5,6,7,8]);

// function mult(A,B) {
// 	_.times(A.length,function(i){
// 		var Bk = B[B.length-1-i];
// 		console.log('--')
// 		_.times(B.length,function(j){
// 			var Ak = A[A.length-1-j];
// 			var Ck = Ak*Bk;
// 			console.log([i,j]+"|",Ak,Bk,Ck);

// 		})
// 	})
// }