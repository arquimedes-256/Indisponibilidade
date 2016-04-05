var webdriverio = require('webdriverio');
var _ = require('underscore');
var fs = require('fs');
var options = {
    desiredCapabilities: {
        browserName: 'chrome'
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
var DT_INICIO_OPERACAO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_tcDetalhes_tabInformacoes_lblPeriodoRecebimento";
var DT_SOLICITACAO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_tcDetalhes_tabInformacoes_lblDataSolicitacao";
var DT_CONFIRMACAO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_tcDetalhes_tabInformacoes_lblDataConfirmacao";
var DT_FECHAMENTO = "#ctl00_ContentPlaceHolder1_ucDetalhesAfretamento_tcDetalhes_tabInformacoes_lblDataFechamento";

var OBJ_POINTER = 0;
var OBJ_POOL = {};
var CURRENT_PAGE = 2;
var i = 9;

i = parseInt(fs.readFileSync('antaq.var.i'));

CURRENT_PAGE = parseInt(fs.readFileSync('antaq.var.CURRENT_PAGE'));

console.log('init, i=',i,'CURRENT_PAGE=',CURRENT_PAGE);

function set(col, val) {
    console.log(col, val)
    if (!OBJ_POOL[OBJ_POINTER])
        OBJ_POOL[OBJ_POINTER] = {};

    OBJ_POOL[OBJ_POINTER][col] = val;
}

function get(x){
	 return 'input[onclick="javascript:__doPostBack(\'ctl00$ContentPlaceHolder1$grdAfretamentos\',\'Select$' + x + '\')"'
}
function loop() {

    var Pause_a;
    var Pause_b;

    client.call(function() {
        client
        	.call(function(){
        		console.log('Pause 5s antes de testar okButton:isVisible')
        	})
            .pause(5000)
            .isVisible("#OKButton",function(isVisible){
            	console.log('isVisible',isVisible)
            	lient.click("#OKButton");
            })
            .call(function(){
            	console.log("Pause 2s antes de testar click na lupa")
            })
            .pause(2000)
            .click(get(i))
     		
            .call(function() {
                console.log("Pause 20s depois de clicar na lupa")
            })
            .pause(20000)
            .call(function() {
                console.log("Após Pause de 20s");
            })
            .then(function() {
                console.log('CURRENT_PAGE', CURRENT_PAGE);
                console.log('i', i);
                client
                    .pause(5000)
                    .waitForText(COL_PROTOCOLO,90000)
                    .getText(COL_PROTOCOLO).then(function(text) {
                        set('protocolo', text);
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

                    	json[obj.protocolo] = obj;
                    	fs.writeFile("antaq.HASH_MAP",JSON.stringify(json))

                        OBJ_POINTER++;
                    })
                    .back().then(function() {


                        i++;
                        if (i >= 10) {
                            i = 0;
                            console.log('proxima página, i=', i)
                            CURRENT_PAGE++;
                            fs.writeFile('antaq.var.i',i);
                            fs.writeFile('antaq.var.CURRENT_PAGE',CURRENT_PAGE);
                            client   
								.scroll(null, 0, 250)
								.setValue(INPUT_PAGE,CURRENT_PAGE)
								.keys("Enter")
                                .call(function(){
                                	console.log("Pause 20s apos o enter")
                                })
                                .pause(20000)
                                .call(function(){
                                	console.log("Iniciando loop")
                                })
                                .then(loop)
                        } else {
                            fs.writeFile('antaq.var.i',i);
                            fs.writeFile('antaq.var.CURRENT_PAGE',CURRENT_PAGE);
                            client
								.scroll(null, 0, 250)
								.setValue(INPUT_PAGE,CURRENT_PAGE)
                                .call(function(){
                                	console.log("Pause 20s apos o enter")
                                })
                                .pause(20000)
                                .then(loop)
                        }

                    });


            });
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
    .url("http://www.antaq.gov.br/SAMA/Registro/ResumoRegistro.aspx")
    .pause(2000)
    .url("http://www.antaq.gov.br/SAMA/Registro/ListarRegistros.aspx?SituacaoRegistro=38&HCheck=true")
    .pause(1000)
    .scroll(null, 0, 250)
    .setValue(INPUT_PAGE,CURRENT_PAGE)
    .keys("Enter")
    .call(function(){
    	console.log("Pause após o enter 20000")
    })
    .pause(20000)
    .then(loop)
//5. se i == 9 => proxima página
//aguarde