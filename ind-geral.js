var MesMap = ["01.Jan", "02.Fev", "03.Mar", "04.Abr", "05.Mai", "06.Jun", "07.Jul", "08.Ago", "09.Set", "10.Out", "11.Nov", "12.Dez"]

Polymer({
    is: 'ind-geral',
    properties:{
        data:{
            observer:'go'
        }
    },
    go: function() {
        if(!this.data)
            return;
        var derivers = $.pivotUtilities.derivers;
        var reportData = this.buildReportData(this.data);
        var sum = $.pivotUtilities.aggregatorTemplates.sum;

        function tempoAgg(attributes) {
            var attr = attributes[0];
            return function(data, rowKey, colKey) {
                return {
                    count: 0,
                    push: function(record) {
                        this.count += record[attr];
                    },
                    value: function() {
                        return this.count;
                    },
                    format: function(x) {
                        return Math.round(x) + " h";
                    }
                };
            };
        }

        function indiceMesAgg(attributes) {
            var attr = attributes[0];
            return function(data, rowKey, colKey) {
                return {
                    sum: 0,
                    count: 0,
                    dias: 0,
                    push: function(record) {
                        this.sum += record[attr];
                        this.dias += record["Qtd dias mes"];
                        this.count++;
                    },
                    value: function() {
                        return (this.sum) / (24 * this.dias * (1 / this.count));
                    },
                    format: function(x) {
                        return (100 * x).toFixed(2) + " %";
                    }
                };
            };
        }

        $(this.$.output).pivotUI(reportData, {

            rows: ["Filial","Rebocador"],
            cols: ["Ano", "Mes"],
            vals: ["Tempo parado"],
            aggregators: {
                "Indice indisponibilidade": function() {
                    return indiceMesAgg(["Tempo parado"])
                },
                "Tempo parado": function() {
                    return tempoAgg(["Tempo parado"]);
                },
                "Valor conserto": function() {
                    return sum()(["Valor conserto"])
                },
                "Valor afretamento": function() {
                    return sum()(["Valor afretamento"])
                },
                "Total do custo": function() {
                    return sum()(["Total do custo"])
                }
            },
            hiddenAttributes: ["Valor conserto", "Valor afretamento", "Total do custo", "Tempo parado", "Qtd dias mes", "Indice indisponibilidade"]
        }, undefined, "pt");
    },
    // f : X -> Y
    buildReportData: function(X) {
        var Y = [];
        _.each(X, function(x) {
            var y = {};
            y["Rebocador"] = x.reb;
            y["Consequencia"] = x.consequencia;
            y["Motivo"] = x.motivo;
            y["Valor conserto"] = x.vlrConserto;
            y["Valor afretamento"] = x.vlrAfretamento;
            y["Total do custo"] = (x.vlrConserto|0) + (x.vlrAfretamento|0);
            y["Tempo parado"] = getIntervaloTempo((x.dtRetorno), (x.dtParada))
            y["Filial"] = x.filial;

            var mesK = moment(x.dtParada, "DD/MM/YYYY").month();
            y["Mes"] = MesMap[mesK];
            y["Ano"] = moment(x.dtParada, "DD/MM/YYYY").year();

            y["Qtd dias mes"] = getQtdDiasMes(x.dtParada);
            //console.log(y["Tempo parado"])
            //console.log('dt', x.dtRetorno, x.dtParada)
            Y.push(y);
        });
        return Y;
    }
});

function getIntervaloTempo(now, then) {
    //var now = new Date();
    //var then = new Date(2014, 3, 1);

    var ms = moment(now, "DD/MM/YYYY HH:mm:ss").diff(moment(then, "DD/MM/YYYY HH:mm:ss"));
    var d = moment.duration(ms);
    //var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
    return (d.asHours());
}

function getQtdDiasMes(dt) {
    var dateFrom = moment(dt, 'DD/MM/YYYY').endOf('month').format('DD');
    return parseInt(dateFrom);
}

setInterval(function(){

    var totalNotCalc = $('.pvtTotal:not(.calculed)');
    var relatorio = $('.pvtAggregator').val();
    console.log(1);
    if((relatorio == "Indice indisponibilidade") && totalNotCalc.length) {
        console.log(2);
        var sufix = relatorio == "Indice indisponibilidade" ? "%" : "h";
        var trRows = $('.pvtTable tr');
        var mod = relatorio == "Indice indisponibilidade" ? 100 : 1;

        _.each(trRows,function(tr){
            var Sum = 0;
            n = 0;
            _.each($(tr).find('td.pvtVal'),function(td){
                var v = parseFloat(td.getAttribute('data-value'));
                if(!_.isNaN(v))
                    Sum+= v;
                n++;
            })
            var X = (mod *Sum/n)

            if(relatorio == "Tempo parado")
                X = Math.round(X);
            else
                X = X.toFixed(2);

            $(tr).find('.pvtTotal:not(.calculed)').text(X+" "+sufix);
            $(tr).find('.pvtTotal:not(.calculed)').addClass('calculed');
        })
        //média das colunas

        _.each($('.pvtTotal.colTotal'),function(td){
            //quantidade de itens para essa coluna e dada por:
            var n = $('.'+td.getAttribute('data-for')).length;
            var v = parseFloat(td.getAttribute('data-value'));
            var X = (mod*v/n)

            if(relatorio == "Tempo parado")
                X = Math.round(X);
            else
                X = X.toFixed(2);

            td.innerText = X+" "+sufix;
        })
        $('.pvtGrandTotal').text("#");
    }

},3000)