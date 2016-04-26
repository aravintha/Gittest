/**
 * check application is installed first time or not, if it is installed first time
 * create the database
 */
// check application installed first time
function createDatabase() {
	var appLaunchCount = window.localStorage.getItem('templatelaunchCount');
	
	if (appLaunchCount) {
	} else {
		createTables();
	    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		window.directoryEntry = window.directoryEntry || window.webkitDirectoryEntry;
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
		window.localStorage.setItem('templatelaunchCount', 1);
	}
}

// create tables
function createTables() {
	var createuserTableQuery = "user(username,password,user_id,company_id,loggedin,lastsyncdate)";
	transactionCreate(createuserTableQuery);
	var createOrderTableQuery = " `order`(id unique,user_id,order_id,added_by,deleted,added_date,edited_date,status,address,contact,phone_number,deadline)";
	transactionCreate(createOrderTableQuery);
	var createTemplateTableQuery = " orderFileDetails(id unique,user_id,added_by,order_id,template_code,name,file,deleted,added_date,edited_date)";
	transactionCreate(createTemplateTableQuery);
	var templateQuery = "template(id unique,company_id,code,name,file,added_date)";
	transactionCreate(templateQuery);
	$.mobile.pageContainer.pagecontainer('change', '#loginpage', {});
}