var Papa = require('babyparse');
var fs = require('fs');
var _ = require('underscore');

   var OUTSet = JSON.parse(fs.readFileSync('antaq.HASH_MAP'));

   var csv = Papa.unparse(_.values(OUTSet), {
            delimiter: ";"
        });
        console.log(csv)

        fs.writeFile("antaq.dump.csv", csv, function(err) {
            if (err) {
                return console.log(err);
            }

            console.log("CSV salvo com sucesso");
        });