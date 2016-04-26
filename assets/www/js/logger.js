/**
 * create log file in sdcard 
 */
var logText;
// get log values
function createLogFile(logValues) {
	var logDate = new Date();
	logText = "[" + logDate + " ] [notice] [" + logValues + "] \n";
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotLogFile,
			fileFail);
}
// get the directory and file
function gotLogFile(fileSystem) {
	fileSystem.root.getDirectory(LOGFILE_DIR, {
		create : true
	}, function fileSystemSuccess(fileSystem) {
		fileSystem.getFile(LOG_FILE_NAME, {
			create : true
		}, gotLogFileEntry, fileFail);
	});
}
// Prepare to writing
function gotLogFileEntry(fileEntry) {
	fileEntry.createWriter(gotFileWriter, fileFail);
}
// append the text in the file
function gotFileWriter(writer) {
	writer.onwrite = function(evt) {
	};
	writer.seek(writer.length);
	writer.write(logText);
	// writer.abort();
}

// file error
function fileFail(error) {
	alert("error : " + error.code);
	console.log("error : " + error.code);
}
