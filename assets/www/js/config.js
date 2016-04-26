/**
 * constant are defined here
 */
var DATABASE_NAME = "offlinepdf";
var DATABASE_VERSION = "1.0";
var DATABASE_SIZE = "1000000";
var PROJECT_NAME = "OfflinePDF";

var LOGFILE_DIR = "offlinepdf";
var LOG_FILE_NAME = "offlinepdf.log";
//var SERVICE_TIME = 120000;
var SERVICE_TIME = 3600000;
var TEMPLATE_DIRECTORY = LOGFILE_DIR+"/templates";
var TEMPLATE_FILE_DIRECTORY = LOGFILE_DIR+"/pdf";

var storeObject = {
	userId : '',
	orderNumber : '',
	appVersion : '',
	syncBtn : '',
	appversion : '',
	companyId:''
};
//var BASE_URL = "http://192.168.1.4/offline-pdf";
var BASE_URL  = "http://checklist.solutionapp.no";
var DATA_URL = BASE_URL+"/offline_pdf_apiservice.php";
var FILE_UPLOAD_URL = BASE_URL+"/offline_pdf_apiupload.php";
var METHOD = "POST";
