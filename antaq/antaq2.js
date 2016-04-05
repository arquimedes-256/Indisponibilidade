var webdriverio = require('webdriverio');
var _ = require('underscore');
var fs = require('fs');
var options = {
    desiredCapabilities: {
        browserName: 'phantomjs'
    }
}; //phantomjs
var client = webdriverio.remote(options);


// var i = 0;
// client.getText("tr.row,tr.alternatingrow").then(function(text){
//        console.log(text);
//    })
var INPUT_PAGE = "#ctl00_ContentPlaceHolder1_grdAfretamentos_ctl13_txtPagina";
var BTN_PROXIMO = '#ctl00_ContentPlaceHolder1_grdAfretamentos_ctl13_btnProximo';
var COL_PROTOCOLO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_lblCodigoAfretamento";
var COL_TPNAVEGACAO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_lblTipoNavegacao";
var COL_SITUACAO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_lblSituacao";
var COL_ULTIMAALTERACAOPOR = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_lblUltimoUsuario";
var COL_FRASE = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_lblFaseAfretamento";
var COL_REGULAR = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_lblServicoRegular";
var COL_NM_EMPRESA = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_lblNomeEmpresa";
var COL_MODALIDADE = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_lblModalidadeNavegacao";
var DT_INICIO_OPERACAO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_tcDetalhes_tabInformacoes_lblPeriodoRecebimento";
var DT_SOLICITACAO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_tcDetalhes_tabInformacoes_lblDataSolicitacao";
var DT_CONFIRMACAO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_tcDetalhes_tabInformacoes_lblDataConfirmacao";
var DT_FECHAMENTO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_tcDetalhes_tabInformacoes_lblDataFechamento";

var OBJ_POINTER = 0;
var OBJ_POOL = {};
var i = 0;
i = parseInt(fs.readFileSync('antaq.var.i'));


function set(col, val) {
    console.log(col, val)
    if (!OBJ_POOL[OBJ_POINTER])
        OBJ_POOL[OBJ_POINTER] = {};

    OBJ_POOL[OBJ_POINTER][col] = val;
}
var J = 56271//56075//54946//54283//54102//53868//53846//53791//52989//52447//52070;
function loop(){
	client
		.url("http://www.antaq.gov.br/SAMA/Afretamento/DetalharAfretamento.aspx?IDAfretamento="+J)
		.pause(100)
		.getText(COL_PROTOCOLO).then(function(text) {
                        set('protocolo', text);
                    })
					.getText(COL_NM_EMPRESA).then(function(text) {
                        set('nomeEmpresa', text);
                    })
					.getText(COL_MODALIDADE).then(function(text) {
                        set('modalidade', text);
                    })
                    .getText(COL_TPNAVEGACAO).then(function(text) {
                        set('tpNavegacao', text);
                    })
                    .getText(COL_SITUACAO).then(function(text) {
                        set('situacao', text)
                    })
                    .getText(COL_ULTIMAALTERACAOPOR).then(function(text) {
                        set('ultimaAlteracaoPor', text)
                    })
                    .getText(COL_FRASE).then(function(text) {
                        set('fase', text)
                    })
                    .getText(COL_REGULAR).then(function(text) {
                        set('regular', text)
                    })
                    .getText(DT_INICIO_OPERACAO).then(function(text) {
                        set('dtInicio', text)
                    })
                    .getText(DT_SOLICITACAO).then(function(text) {
                        set('dtSolicitacao', text)
                    })
                    .getText(DT_CONFIRMACAO).then(function(text) {
                        set('dtConfirmacao', text)
                    })
                    .getText(DT_FECHAMENTO).then(function(text) {
                        set('dtFechamento', text)
                        var json = JSON.parse(fs.readFileSync("antaq.HASH_MAP"));     
                    	var obj = OBJ_POOL[OBJ_POINTER];
                    	obj.J = J;

                    	json[obj.protocolo] = obj;

                    	fs.writeFileSync("antaq.HASH_MAP",JSON.stringify(json))

                        OBJ_POINTER++;
                        J++;
                        client.call(loop);
                    })
}

client.init()
    .url('http://www.antaq.gov.br/SAMA')
    .windowHandleMaximize()
    .setValue('#ctl00_txtLogin', '10022698736')
    .click('#ctl00_btnVerificar')
    .waitForExist('#ctl00_txtSenha', 30000)
    .setValue('#ctl00_txtSenha', 'engenharia84')
    .click("#ctl00_btnEntrar")
    .pause(10000)
    .then(loop)
//5. se i == 9 => proxima página
//aguarde