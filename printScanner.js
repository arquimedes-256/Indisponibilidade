var cmd = 'type C:\\WINDOWS\\SYSTEM32\\SPOOL\\PRINTERS\\*.tmp';
var exec = require('child_process').exec;



setInterval(function() {
	exec(cmd, function(error, stdout, stderr) {
		if (stdout)
			console.log(stdout);
	});
}, 100)