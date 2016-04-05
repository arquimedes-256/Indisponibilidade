Polymer({
    is: 'ind-maintable',
    ready: function() {
        var W = jQuery(window).width();

        if (W <= 1024) {
            this.style.zoom = .78;
            jQuery('paper-dropdown-menu').css({
                width: 132
            });
        } else if (W <= 1241) {
            this.style.zoom = .92;
        } else if (W <= 1280) {
            this.style.zoom = .95;
        }
        this.render()
    },
    timeSelected:function() {
        var HH  = new String(this.$.timePicker.hour);
        var mm  = new String(this.$.timePicker.minute);

        if(HH.length == 1) HH = [0,HH].join("");
        if(mm.length == 1) mm = [0,mm].join("");

        var fullHourString = [HH,mm].join(":");
        this.applyToSelectedDate(fullHourString);
    },
    applyToSelectedDate:function(fullHourString) {
        var oldFullDtString = this.newRegistro[this.currentDateKey];
        var oldDtString = oldFullDtString.split(" ")[1];

        this.newRegistro[this.currentDateKey] = 
            oldFullDtString.replace(oldDtString,fullHourString);

        window.ref.child(this.newRegistroId).update(this.newRegistro);
        gridTableNew.render();
    },
    deleteRenderer: function(instance, td, row, col, prop, value, cellProperties) {
        td.innerHTML = '<iron-icon icon="icons:delete"></iron-icon>'
        with(td.style) {
            verticalAlign = "middle";
            textAlign = "center";
            cursor = "pointer";
        }
        td.onclick = function() {
            var _obj = this.data[cellProperties.row];
            var id = _obj.id;
            console.log(id, cellProperties, this);
            if (confirm("Tem certeza que deseja excluir esse registro ?")) {
                console.log("Registro", id, "excluido com sucesso");
                var TD = jQuery(td).parent().find('td');

                TweenMax.to(TD, 1, {
                    css: {
                        background: "#FFD600",
                        height: 0,
                        opacity: 0
                    }
                });
                this.async(function() {
                    new Firebase(FB_URL + "/lancamentos/" + id).remove();
                }, 900);
                
            } else {
                console.log("Cancelado")
            }
        }
            .bind(this);

        return td;
    },
    addRenderer: function(instance, td, row, col, prop, value, cellProperties) {
        td.innerHTML = '<iron-icon icon="icons:add-circle"></iron-icon>';
        td.style.cursor = "pointer";
        td.onclick = function() 
        {
            var lancamentoData = this.data[cellProperties.row];
            document.querySelector('ind-historico').open(lancamentoData)
        }
            .bind(this);
        return td;
    },
    render: function() {
        window.INDISPONIBILIDADE_COLUMNS_HEADERS =
            ["#", "Rebocador", "Dt.Parada", "Dias.Estim", "Hrs.Estim", "Dt.Retorno",
            "Motivo", "Observação do Motivo",
            "Consequencia", "Conserto(R$)", "Afret.(R$)",
            "Indisp(?)", "#"
        ];
        window.INDISPONIBILIDADE_COLUMNS = [{
            data: 'addThis',
            renderer: this.addRenderer.bind(this),

        }, {
            data: 'reb',
            type: 'dropdown',
            source: window.REB_LIST,
        }, {
            data: 'dtParada',
            type: 'date',
            dateFormat: 'DD/MM/YYYY H:mm',
            correctFormat: true
        }, {
            data: 'diasParada',
            type: 'numeric',
            format: '0'
        }, {
            data: 'tempoParada',
            type: 'numeric',
            format: '0'
        }, {
            data: 'dtRetorno',
            type: 'date',
            dateFormat: 'DD/MM/YYYY H:mm',
            correctFormat: true
        }, {
            data: 'motivo',
            type: 'dropdown',
            source: MOTIVO_LIST
        }, {
            data: 'observacao'
        }, {
            data: 'consequencia',
            type: 'dropdown',
            source: CONSEQUENCIA_LIST
        }, {
            data: 'vlrConserto',
            type: 'numeric',
            format: '0,0.00'
        }, {
            data: 'vlrAfretamento',
            type: 'numeric',
            format: '0,0.00'
        }, {
            data: 'isIndisponibilidade',
            type: 'checkbox'
        }, {
            renderer: this.deleteRenderer.bind(this),
            data: 'deleteThis'
        }];

        this.renderTable();
    },
    proxyData: function(data) {
        window.INDTABLE = {};
        _.each(data, function(v, k) {
            INDTABLE[v.id] = v;
        })
        _.each(data, function(v) {
            if (_.isUndefined(v.isIndisponibilidade))
                v.isIndisponibilidade = false;
        });
    },
    renderTable: function() {
        var container = this.$.main;
        container.innerHTML = "";

        if (this.data && this.data.length) {
            this.proxyData(this.data);
            window.gridTable = new Handsontable(container, {
                data: this.data,
                colHeaders: INDISPONIBILIDADE_COLUMNS_HEADERS,
                rowHeaders: false,
                colWidths: [40, 80, 80, 75, 70, 80, 130, 240, 150, 100, 115, 80],
                height: 540,
                width: 1326,
                columnSorting: true,
                columns: INDISPONIBILIDADE_COLUMNS,

                afterChange: function(changes, source) {
                    if (source == "edit") {
                        console.log(changes, source);

                        _.each(changes, function(c) {


                                if (c[2] != c[3]) {
                                    var _obj = this.data[c[0]];
                                    var id = _obj.id;
                                    var EDIT = {
                                        key: c[1],
                                        val: c[3],
                                        oldVal: c[2],
                                        id: id
                                    };
                                    var has24h = getIntervaloTempo(undefined, moment(_obj.lastTime)
                                        .format('DD/MM/YYYY'));

                                    console.log(EDIT, c)
                                    console.log('has24h', has24h);

                                    // if (has24h >= 24) {
                                    //     alert("Você não pode alterar um registro antigo lançado.")
                                    //     this.async(gridTable.undo, 1000);
                                    //     return;
                                    // }


                                    if (IS_BLOCKED) {
                                        alert("Esse mês está fechado.")
                                        this.async(gridTable.undo, 1000);
                                        return;
                                    }
                                    if (EDIT.key == "isIndisponibilidade" && EDIT.val === true 
                                        && !confirm("Você deseja realmente marcar isso como uma indisponibilidade e enviar um email?")){
                                        this.async(gridTable.undo, 1000);
                                        return;
                                    }

                                    if (validateValue("INDISPONIBILIDADE", EDIT.val, EDIT.key) && EDIT.key != "deleteThis" && EDIT.key != "addThis") {
                                        var updateObj = {};
                                        updateObj.lastTime = new Date().getTime();
                                        updateObj.login = CURRENT_USER_LOGIN.login;
                                        //updateObj.isCorrigido = true;
                                        updateObj[EDIT.key] = EDIT.val;
                                        updateObj.filial = get.filial_by_reb(updateObj.reb);
                                        //se for tempo parada, armazenar em histórico
                                        //if(EDIT.key == "tempoParada") {
                                        //  window.ref.child(id).child("tempoParadaHistorico").push({oldVal:EDIT.oldVal,login:CURRENT_USER_LOGIN.login})
                                        //}

                                        if (EDIT.key == "dtRetorno") {
                                            this.onRebocadorRetornou(updateObj,id);
                                        }

                                        if(EDIT.key.startsWith("dt")) 
                                        {
                                            this.newRegistro = updateObj;
                                            this.newRegistroId = id;
                                            this.currentDateKey = EDIT.key;
                                            var M = moment(EDIT.val.split(" ")[1],"H:mm");
                                            with(this.$.timePicker) 
                                            {
                                                hour = M.hour();
                                                minute = M.minutes();
                                            }
                                            this.$["picker-dialog"].open();
                                            return;
                                        }

                                        window.ref.child(id).update(updateObj);
                                        this.removeCalendarios();

                                        this.$.toast.text = "Registro indexado em: " + _obj.dtParada + " alterado de " + c[2] + " para " + c[3];
                                        this.$.toast.show();

                                    } else {
                                        alert("Valor inserido inválido, por favor utilize algum valor válido, use CTRL+Z para retornar");
                                        //console.log('error ==> _obj',_obj)
                                    }

                                }

                            }
                            .bind(this))
                    }
                }.bind(this)
            });
        } else
            container.innerHTML = "Não existem valores para os filtros consultados.";

        this.$.newLanc.render();
    },
    onRebocadorRetornou:function(updateObj,id) {
        var SumTempo = 0;
        var obj = INDTABLE[id];

        _.each(obj.historico,function(h){
            SumTempo += h.tempoParada;
        });

        console.log('onRebocadorRetornou',updateObj,INDTABLE[id])
        console.log('SumTempo :',SumTempo)

        var delta_T = getIntervaloTempo(updateObj.dtRetorno,obj.dtParada);
        console.log('delta_T',delta_T);

         window.ref.child(id).update({tempoParada:delta_T,diasParada:0});

         window.ref.child(id+"/historico").push({
            observacao:"Tempo estimado inicialmente",
            tempoParada: (obj.tempoParada|0) + (obj.diasParada*24|0),
            login:CURRENT_USER_LOGIN.login,
            timestamp:new Date().getTime()
         })
        this.$.indHistorico.enviarEmail();
    },
    showInsertModal: function(e, d, s) {
        var S = this.$.newLanc.style;
        var fab = this.$.fab;

        if (S.display == "none" || !S.display)
            S.display = "block", fab.icon = "close";
        else
            S.display = "none", fab.icon = "add";

    },
    removeCalendarios: function() {
        jQuery('.htDatepickerHolder').remove();
    }
});
