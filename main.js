function columnsToMap(A) {
	var X = {};
	_.each(A, function(a) {
		if (a.source)
			X[a.data] = a.source
		else
			X[a.data] = null;
	});
	return X;
}

function validateValue(TYPE, newValue, column) {
	var A = null;
	if (~["DOCAGEM", "INDISPONIBILIDADE", "LINEUP"].indexOf(TYPE)) {
		A = window[[TYPE, "COLUMNS"].join("_")];
	} else
		throw new Error("Não existe isso " + TYPE);
	if (!A)
		throw new Error("Conjunto Inexistente");

	var Map = columnsToMap(A);
	var Map_c = Map[column];

	var isValid = Boolean(Map_c === null || ~(Map_c || []).indexOf(newValue));
	console.log("validando, col:", column, '= val:', newValue, '=>', isValid);
	return isValid;
}



var BASE_URL = 'http://sn-indisponibilidade.firebaseio.com'

var URL_LANCAMENTOS = [BASE_URL, 'lancamentos'].join('/');
var URL_FILIAL_REBOCADORES = [BASE_URL, 'filial-rebocadores'].join('/');
var URL_FILIAL_GERENTES = [BASE_URL, 'filial-gerentes'].join('/');

var FilialToRebocadores = null;
var FilialToGerentes = null;

var P = [];

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