var _ = require('underscore');
var Firebase = require('firebase');
var BASE_URL = 'http://sn-indisponibilidade.firebaseio.com'

var URL_LANCAMENTOS = [BASE_URL, 'lancamentos'].join('/');
var URL_FILIAL_REBOCADORES = [BASE_URL, 'filial-rebocadores'].join('/');
var URL_FILIAL_GERENTES = [BASE_URL, 'filial-gerentes'].join('/');

var FilialToRebocadores = null;
var FilialToGerentes = null;

var P = [];
var fs = require('fs');
var http = require('http');
var moment = require('moment');

//1. lançamentos
new Firebase(URL_LANCAMENTOS)
	.on('value', function(dataSnapShot) {
		console.log('FirebaseOnValue')
		var V = dataSnapShot.val();
		_.each(V, function(v, k) {
			v.id = k;
		})
		P = _.values(V);
		init()
	});
//2. filial-rebocadores
new Firebase(URL_FILIAL_REBOCADORES)
	.on('value', function(dataSnapshot) {
		FilialToRebocadores = dataSnapshot.val();
	});
//3. filial-gerentes
new Firebase(URL_FILIAL_GERENTES)
	.on('value', function(dataSnapshot) {
		FilialToGerentes = dataSnapshot.val();
	});

var get = {
	filial_by_reb: function(reb) {
		var F = null;
		_.each(FilialToRebocadores, function(rebs, filial) {
			if (_(rebs).contains(reb))
				F = filial
		})
		return F;
	},
	gerente_by_filial: function(filial) {
		return FilialToGerentes[filial];
	},
	gerente_by_reb: function(reb) {
		var a = get.filial_by_reb(reb);
		var b = get.gerente_by_filial(a);
		return _.keys(b);
	}
}

//columns alias , tempo estimado e last time
var $tE = 'tempoParada';
var $tL = 'lastTime';
var $1_MIN = 1e3 * 60;
var $1_HOUR = $1_MIN * 60;


var jobInterval = null;

function f() {
	console.log('ff(x)')
	_.each(P, function(p) {
		p.totalTempo = (p.tempoParada | 0) + (p.diasParada | 0) * 24;
	});
	_.each(P, function(p) {
		if (p.isIndisponibilidade) {
			//1. Primeiro caso 2 < tE < 24
			if (2 < p.totalTempo && p.totalTempo < 24) {
				// se tL é aproximadamente 1 minuto envie um email
				if (isApprox(p, $1_MIN, 'A1')) {
					sendEmail(p, false, 'Branch.A1, aprox 1min', '1_MIN');
				}
				// se tL é aproximadamente 1 hora envie um email para o gerente
				else if (isApprox(p, $1_HOUR, 'A2')) {
					sendEmail(p, true, 'Branch.A2, aprox 1hour', '1_HOUR');
				}
				//console.log('Branch A');
			}
			//2. Segundo caso tE >= 24
			else if (p.totalTempo >= 24) {
				// se tL é aproximadamente 1 minuto envie um email
				if (isApprox(p, $1_MIN, 'B1')) {
					sendEmail(p, false, 'Branch.B1, aprox 1min', '1_MIN');
				}
				//enviar email de cada 12 em 12 horas
				if (isApprox(p, $1_HOUR * 12, 'B2', true)) {
					sendEmail(p, false, 'Branch.B2, aprox 12hours', '12_HOUR');
					// zerar tL <- agora.
					new Firebase(URL_LANCAMENTOS + "/" + p.id).update({
						lastTime: new Date().getTime()
					})
				}
			}
		}
	})
}

// testa se tL está próximo de x
function isApprox(p, x, Branch, use_tE) {
	var tL = p[$tL];
	if (tL === undefined)
		return;
	var t = tL;
	if (use_tE) {
		t = moment(p.dtParada, "DD/MM/YYYY H:mm").toDate().getTime();
	}
	var d1 = t;
	var d2 = new Date().getTime();
	var dc = d2 - d1;
	var X = ((x - 10e3) <= dc) && (dc <= (x + 10e3));
	console.log('Branch', Branch, p.id, 'tE', p.tempoParada, 'dc/x = ', dc + '/' + x, '   ', (dc / x).toFixed(3), '=>', X)
	return X;
}

function sendEmail(p, onlyManger, motivo, $FLAG_KEY_LOCK_TIME) {
	if (!p[$FLAG_KEY_LOCK_TIME] || p.isCorrigido) {

		var LOG = "";
		console.log(new Array(8).join('='))
		if (onlyManger) console.log("Para gerente");
		console.log(new Date().toUTCString());
		console.log(p.id, 'Email enviado, motivo:', motivo, 'key');
		console.log(p.observacao)
		console.log(new Array(8).join('='))

		var obj = {};
		obj[$FLAG_KEY_LOCK_TIME] = true, obj.isCorrigido = false;

		new Firebase(URL_LANCAMENTOS + "/" + p.id).update(obj);

		fs.writeFileSync("log/" + new Date().getTime() + ".log",
			"Para gerente ? " + onlyManger +
			JSON.stringify(p) + '\nobj: ' + JSON.stringify(obj));
		var http = require('http');
		p.goodDay = getGoodDay();
		p.onlyManger = onlyManger;
		p.gerentes = get.gerente_by_reb(p.reb);
		p.dtEstimada = moment(p.dtParada, "DD/MM/YYYY HH:mm:ss")
			.add(p.tempoParada, 'hours')
			.add(p.diasParada, 'days')
			.format('DD/MM/YYYY HH:mm');

		requestEmail(p);
	}
}

function getGoodDay() {
	var today = new Date()
	var curHr = today.getHours();

	if (curHr < 12) {
		return ("Bom dia")
	} else if (curHr < 18) {
		return ("Boa tarde")
	} else {
		return ("Boa noite")
	}
}

function init() {
	console.log('initJob')
	clearInterval(jobInterval)
	jobInterval = setInterval(f, 2000);
}

function requestEmail(p) {
	var options = {
		host: '201.45.163.179',
		port: 8083,
		path: ['/mail/sendmail.php', encodeURI(JSON.stringify(p))].join('?p=')
	};

	http.get(options, function(resp) {
		resp.on('data', function(chunk) {
			console.log(chunk);
		});
	}).on("error", function(e) {
		console.log("Got error: " + e.message);
	});

}
//Aprox 12
//new Date(new Date() - 11.95 *60*60*1000).getTime()