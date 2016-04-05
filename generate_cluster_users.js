//Gerenerate Cluster users
var _ = require('underscore');
var Users = [
	// 	["Marcelle Silva" 		,"SDR"],
	// 	["Marcio Faustino" 		,"SDR"],
	// 	["Gustavo Neves" 		,"SDR"],
	// 	["Claudemiro Magela" 	,"SDR"],
	// 	["Anderson Souza" 		,"SDR"],
	// 	["Marcelle Silva" 		,"MAC"],
	// 	["Marcio Faustino" 		,"MAC"],
	// 	["Gustavo Neves" 		,"MAC"],
	// 	["Claudemiro Magela" 	,"MAC"],
	// 	["Anderson Souza" 		,"MAC"],
	// 	["Marcelle Silva" 		,"VIT"],
	// 	["Marcio Faustino" 		,"VIT"],
	// 	["Gustavo Neves" 		,"VIT"],
	// 	["Marcelo Costa" 		,"VIT"],
	//["Marluce Reis" 			,"VIT"],
	//["Marluce Reis" 			,"SDR"],
	//["Marluce Reis" 			,"MAC"],
	// ["Claudemiro Magela" 	,"RJ1"],
	// ["Anderson Souza" 		,"RJ1"],
	// ["Marcelo Costa" 		,"RJ1"],
	// ["Marluce Reis" 			,"RJ1"],
	// ["Thairara Cristina"		,"RGD"]
	//["Bruno Tavare"			,"RGD"]

	// ["Bruno Loeser",			"RGD"],
	// ["Alexandre Santos",		"RGD"],
	// ["Helton Farias",			"RGD"],
	// ["Alex Lode",				"RGD"],
	// ["Pedro Camargo",			"RGD"],
	// ["Carlos Medeiros",			"RGD"],
	// ["Danilo Sarraff",			"RGD"],
	// ["Leandro Medeiros",		"RGD"],

	// ["Bruno Loeser",			"PNG"],
	// ["Alexandre Santos",		"PNG"],
	// ["Helton Farias",			"PNG"],
	// ["Alex Lode",				"PNG"],
	// ["Pedro Camargo",			"PNG"],
	// ["Carlos Medeiros",			"PNG"],
	// ["Danilo Sarraff",			"PNG"],
	// ["Leandro Medeiros",		"PNG"],

	// ["Bruno Loeser",			"STR"],
	// ["Alexandre Santos",		"STR"],
	// ["Helton Farias",			"STR"],
	// ["Alex Lode",				"STR"],
	// ["Pedro Camargo",			"STR"],
	// ["Carlos Medeiros",			"STR"],
	// ["Danilo Sarraff",			"STR"],
	// ["Leandro Medeiros",		"STR"]
	//["Nilson Teixeira", "VIT"],
	//["Nilson Teixeira", "RJ1"],
	//["Nilson Teixeira", "SDR"],
	//["Nilson Teixeira", "MAC"]
	["Gessika Lopes", "STR"],
	["Gessika Lopes", "PNG"],
	["Gessika Lopes", "RGD"],
	["Gessika Lopes", "SEP"],

];
var TB_FILIAL = {
	"AJU": 21,
	"MTZ": 10,
	"ITA": 4,
	"PNG": 5,
	"SDR": 6,
	"MAC": 7,
	"RGD": 8,
	"SEP": 9,
	"VIT": 1,
	"RJ1": 2,
	"STR": 3,
	"GUA": 22,
	"TMD": 99
}
var Out = [];
var Y = [];
_.each(Users, function(u) {
	var nome = u[0];
	var filial = u[1];

	var Nms = nome.split(" ");
	var login = Nms[0].substr(0, 2) + Nms[1].substr(0, 2) + "." + filial;

	var user = {
		login: login,
		filial: TB_FILIAL[filial],
		nome: nome,
		email: nome.toLowerCase().replace(" ", ".") + "@sulnorte.com.br"
	}
	Y.push(user);
	Out.push(buildQuery(user))
})
console.log(Out.join("\n"));
console.log(_.map(Y, function(y) {
	return y.login + ": " + y.nome
}).join("\n"));

function buildQuery(user) {
	return "UPDATE TB_USUARIO set SITUACAO = 'I' where DS_EMAIL = '" + user.email + "' AND is_aux is null or login ='" + user.login + "';INSERT INTO TB_USUARIO (\"ID_USUARIO\", \"ID_PERFIL\", \"ID_FILIAL\", \"NOME\", \"LOGIN\", \"SENHA\", \"SITUACAO\", \"IND_TP_USUARIO\", \"ID_TIPO\", \"ID_USUARIO_APROVADOR\", \"ID_USUARIO_PAR\", \"DS_EMAIL\", \"IN_APROVADOR\", \"IN_ATIVO\", \"DT_DESATIVACAO\",is_aux) " +
		"VALUES (sq_usuario.NEXTVAL, '2', '" + user.filial + "', '" + user.nome + "', '" + user.login + "', 'b7a9681f61615b56e2d8f20afbf9dbedabd24df1', 'A', 'N', NULL, '1041', NULL, '" + user.email + "', 'N', 'S', NULL,'A');"
}