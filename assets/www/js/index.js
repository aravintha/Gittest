/**
 * this page initialize the cordova and initialize all pages and their click
 * events
 */
var serviceName = 'com.processdrive.offlinepdf.' + PROJECT_NAME + 'BackupService';
var totalTemplatFile = 0;
var templatFileCount = 0;
var failCount = 0;

init();
function init() {
	document.addEventListener('deviceready', onDeviceReady, false);
}
// device ready event initialize the cordova
function onDeviceReady() {
	$.mobile.autoInitialize = false;
	$.mobile.autoInitailize = false;
	selectUser();
	createDatabase();
	onBackPressed();
	getAppVersion();
	
	factory = cordova.require('com.red_folder.phonegap.plugin.backgroundservice.BackgroundService');
	myService = factory.create(serviceName);
}
/**
 * login page functionalities
 */
$(document).on('pagebeforeshow', '#loginpage', function() {
	totalTemplatFile = 0;
	templatFileCount = 0;
	failCount = 0;
	setLanguage();
	$("#appname").text(PROJECT_NAME);
});
// login button click
$(document).on(
		"click",
		"#loginButton",
		function() {
			var username = $("#username").val();
			var password = $("#password").val();
			if (username == "") {
				commonI18init("usernameValidation");
				$("#username").focus();
			} else if (password == "") {
				commonI18init("passwordValidation");
				$("#password").focus();
			} else {
				var lastsyncDate = getCurrentTime();
				params = "service=login&username=" + username + "&password="
						+ password;
				connectionStatus = navigator.onLine ? 'online' : 'offline';
				if (connectionStatus == "online") {
					showLoadingMessage("login");
					callServer(DATA_URL, params, METHOD, loginResponse);
				} else {
					commonI18init("enableInternet");
					//var query = " username='"+username+
				}
			}
		});

// logged user
function returnLoggedUser(results) {
	if (results.rows.length > 0) {
		storeObject.userId = results.rows.item(0).user_id;
		storeObject.companyId = results.rows.item(0).company_id;
		storeObject.orderNumber ="order number";
		$.mobile.pageContainer.pagecontainer('change', '#listpage', {});
		 getServiceStatus();
	} else {
		// window.location.hash = "#loginpage";
		$.mobile.pageContainer.pagecontainer('change', '#loginpage', {});
	}
}

// if database not exists change to login page
function noDBError(e) {
	$.mobile.changePage("#loginpage");

}
// get application version
function getAppVersion() {
	customPlugin.createEvent(returnVersion, failure, "GetVersionName");
	function returnVersion(results) {
		storeObject.appVersion = results;
		$("#appversion").text(results);
		$("#appversion1").text(results);
	}
	function failure(e) {
		alert(JSON.stringify(e));
		console.log("fail" + e);
	}
}
// login response from server
function loginResponse(response) {
	if (response) {
		var opts = eval('(' + response + ')');

		if (opts.status == "success") {
			var lastsyncDate = getCurrentTime();
			var insertUserQuery = "INSERT OR REPLACE INTO user(username,password,user_id,loggedin,lastsyncdate,company_id) values(?,?,?,?,?,?)";

			var insertUserValues = [ opts.results.username,
					opts.results.password, opts.results.id, "1", lastsyncDate,opts.results.company_id ];
			transactionInsert(insertUserQuery, insertUserValues);
			showLoadingMessage(loginmsg);
			storeObject.userId = opts.results.id;
			storeObject.companyId = opts.results.company_id ;
			userId = storeObject.userId;

			var query = " max(added_date) as maximumDate from template";
			transactionSelect(query, "returnMaxDate");
		} else {
			alert(opts.status);
			$.mobile.loading('hide');
		}
	}else{
		$.mobile.loading('hide');
		alert(opts.status);
	}
}

// get max date from template table
function getTemplateMaxDate(results) {
	var templateMaxDate = "";
	if (results.rows.length > 0) {
		if (results.rows.item(0).added_date)
			templateMaxDate = results.rows.item(0).added_date;
	}
	userId = storeObject.userId;
	storeObject.orderNumber = "order number";
	var skiParams = "service=template&updated_date=" + templateMaxDate+ "&user_id="+ userId;
	callServer(DATA_URL, skiParams, METHOD, templateResponse);
}
// template response
function templateResponse(response) {
	if (response) {
		var opts = eval('(' + response + ')');

		if (opts.status == "success") {
			var j = 0;

			totalTemplatFile = opts.count;
			for ( var i = 0; i < opts.results.length; i++) {
				var templateFileName = opts.results[i].file;
				if (opts.results[i].file) {
					
					var skiTemplateFileJSON = eval('('+ templateFileName + ')');
					console.log(BASE_URL + "/" + skiTemplateFileJSON[0].name);
					var fileExist = URLExists(BASE_URL + "/"
							+ skiTemplateFileJSON[0].name);
					if (fileExist) {
						//var filename = templateFileName.split("/");
						var filename = /[^/]*$/.exec(skiTemplateFileJSON[0].name)[0];
						var templateQuery = "insert or replace into template(id,company_id,code,name,file,added_date) values(?,?,?,?,?,?)";
						var templateInputValues = [ opts.results[i].id,
						        opts.results[i].company_id,
								opts.results[i].code,
								opts.results[i].name, filename,
								opts.results[i].added_date ];
						transactionInsert(templateQuery, templateInputValues);
						/*customPlugin.createEvent(function(results) {
							templatFileCount++;
							console.error("total" + totalTemplatFile);
							console.error("local " + templatFileCount);
							if (totalTemplatFile == templatFileCount) {
								getServiceStatus();
								$.mobile.changePage("#listpage");
							}
						}, fileDownloadFail, "live", {
							"source" : BASE_URL + "/" + skiTemplateFileJSON[0].name,
							"newfilename" : filename,
							"destination" : TEMPLATE_DIRECTORY
						});*/
						//downloadFile(BASE_URL + "/" + skiTemplateFileJSON[0].name,TEMPLATE_DIRECTORY,filename);
						downloadFiles(BASE_URL + "/" + skiTemplateFileJSON[0].name,filename,TEMPLATE_DIRECTORY,totalTemplatFile);
getServiceStatus();
					} else {
						--totalTemplatFile;
						failCount++;
						if (failCount >= opts.results.length) {
							//storeObject.userId = "userId";
							$.mobile.changePage("#listpage");
						}
					}
				}
			}
		} else {
			$.mobile.changePage("#viewpage");
		}
	}
}

/**
 * list page functionalities
 * 
 */
// list page show
$(document).on("pagebeforeshow", "#listpage", function() {
	setLanguage();
	$("#appname1").text(PROJECT_NAME);
	
	userId = storeObject.userId;
	connectionStatus = navigator.onLine ? 'online' : 'offline';
	if (storeObject.orderNumber && connectionStatus == "online") {
		getOrderNumbersFromLocal(userId);
		// getOrderList(userId);
	} else {
		getOrderList(userId);
	}
});

// get orders from server
function getOrderNumbersFromLocal(userId) {
	
	localOrderArray = [];
	liveOrderArray = [];
	var orderNumberQuery = " order_id from `order` where user_id='" + userId
			+ "'";
	transactionSelect(orderNumberQuery, "getordernumber");
}
// returned order numbers
function constructOrderNaumberArray(results) {
	liveOrderArray.length = 0;
	localOrderArray.length = 0;
	if (results.rows.length) {
		for ( var i = 0; i < results.rows.length; i++) {
			localOrderArray.push(results.rows.item(i).order_id);
		}
	}
	var query = " MAX(added_date) as addedDate from `order` where user_id='"
			+ userId + "'";
	lastSyncDate = "";
	setTimeout(function() {
		getOrdersFromServer(lastSyncDate);
	}, 1000);
}
// get maximum date
function returnMaximumDate(results) {
	
	var lastSyncDate = "";
	if (results.rows.length) {
		if (results.rows.item(0).addedDate) {
			var syncDate = results.rows.item(0).addedDate;
			var date = new Date(syncDate);
			lastSyncDate = date.format("yyyy-mm-dd HH:MM:ss");
		}
	}
	
	getOrdersFromServer(lastSyncDate);
}
// get orders from server
function getOrdersFromServer(lastSyncDate) {
	
	userId = storeObject.userId;
	showLoadingMessage(getDatasFromServerMsg);
	var params = "service=get_orders&user_id=" + userId + "&lastupdateddate="
			+ lastSyncDate;
	console.log(DATA_URL+""+params);
	createLogFile(params);
	connectionStatus = navigator.onLine ? 'online' : 'offline';
	if (connectionStatus == "online") {
		callServer(DATA_URL, params, METHOD, serverResponseForOrders);
	} else {
		commonI18init("enableInternet");
		$.mobile.loading('hide');
	}
}
// server response
function serverResponseForOrders(response) {
	liveOrderArray = [];
	var jsonParsed = eval("(" + response + ")");
	if (jsonParsed.status == "success") {
		if (jsonParsed.results.length == 0) {
			commonI18init("emptyProject");
			$.mobile.loading('hide');
		} else {
			
			var missingOrders = [];
			liveOrderCount = jsonParsed.results.length;
			var query = "";
			var orderQuery = "insert into `order`(id,user_id,order_id,added_by,deleted,added_date,status,address,contact,phone_number,deadline) values(?,?,?,?,?,?,?,?,?,?,?)";
			var templateQuery = "insert into orderFileDetails(id,user_id,added_by,order_id,template_code,name,file,deleted,added_date,edited_date) values(?,?,?,?,?,?,?,?,?,?)";
			
			for ( var i = 0; i < jsonParsed.results.length; i++) {
				
				var ordernumber = jsonParsed.results[i].order_id;
				
				var arrComp = $.inArray(ordernumber, localOrderArray);
				liveOrderArray.push(ordernumber);
				
				if (arrComp >= 0) {
					liveOrderCount--;
				} else {
					var orderValues = [ jsonParsed.results[i].id,
							storeObject.userId, jsonParsed.results[i].order_id,
							jsonParsed.results[i].addedby_name, "0",
							jsonParsed.results[i].added_date,
							jsonParsed.results[i].status,
							jsonParsed.results[i].address,
							jsonParsed.results[i].contact,
							jsonParsed.results[i].phone_number,
							formatDate(jsonParsed.results[i].deadline,"dd.mm.yyyy")];
					
					var orderFileDetails = jsonParsed.results[i].order_files;
					for ( var j = 0; j < orderFileDetails.length; j++) {
						var orderFiles = orderFileDetails[j].file;
							
						var orderFileJSON = eval('('+ orderFiles + ')');
						var filename = /[^/]*$/.exec(orderFileJSON[0].name)[0];
						var templateValues = [ orderFileDetails[j].id,
								storeObject.userId,
								orderFileDetails[j].addedby_name,
								orderFileDetails[j].order_id,
								orderFileDetails[j].template_code,
								orderFileDetails[j].name, orderFiles, "0",
								orderFileDetails[j].added_date, orderFileDetails[j].edited_date ];
						transactionInsert(templateQuery, templateValues);
						/*customPlugin.createEvent("", fileDownloadFail, "live",
								{
									"source" : BASE_URL + "/"
											+ orderFileJSON[0].name,
									"newfilename" : filename,
									"destination" : TEMPLATE_FILE_DIRECTORY
								});*/
						downloadFile(BASE_URL + "/" + orderFileJSON[0].name,filename,TEMPLATE_FILE_DIRECTORY);
					}
					transactionInsert(orderQuery, orderValues);

				}

			}
			
			jQuery.grep(localOrderArray, function(el) {
				
				if (jQuery.inArray(el, liveOrderArray) == -1)
					missingOrders.push(el);
			});
			
			// delete local order if not exists in server
			for ( var l = 0; l < missingOrders.length; l++) {
				deleteLocalOrder(missingOrders[l]);
			}
			if (liveOrderCount > 0) {
				syncDate = getCurrentTime();
				var setUpdateLastSyncQuery = "user SET lastSyncDate='"
						+ syncDate + "'  WHERE userid='" + userId + "'";
				transactionUpdate(setUpdateLastSyncQuery,"");
				$.mobile.loading('hide');
				alert(orderReceiveLang + " " + liveOrderCount + " "
						+ projectLang);
			} else {
				commonI18init("emptyProject");
				$.mobile.loading('hide');
				$('#syncBtn').closest('.ui-btn').show();
			}
		}
	} else if (jsonParsed.status == "error") {
		commonI18init("emptyProject");
		$.mobile.loading('hide');
	} else {
		alert(jsonParsed.status);
		$.mobile.loading('hide');
	}
	getOrderList(userId);
}
// delete local orders
function deleteLocalOrder(orderId) {
	var deleteOrderQuery = "'order' where order_id='" + orderId + "'";
	transactionDelete(deleteOrderQuery);
}

// sync from server
$(document).on("click", "#syncfromserver", function() {
	userId = storeObject.userId;
	getOrderNumbersFromLocal(userId);
});
// start service button click
$(document).on("click", "#startService", function() {
	enableTimer();
});
// logout
$(document).on("click", "#logout", function() {
	logout();
});
// set logout status in database
function logout() {
	showLoadingMessage(logoutmsg);
	userId = storeObject.userId;
	var logoutQuery = " user SET loggedin=0  WHERE user_id='" + userId + "'";
	transactionUpdate(logoutQuery, "logout");
}
// logout and redirect to login page
function returnLogoutStatus(results) {
	$.mobile.loading('hide');
	$.mobile.pageContainer.pagecontainer("change", "#loginpage", {});
}

/**
 * edit page functionalities
 */
// edit page show
$(document).on("pagebeforeshow", "#ordereditpage", function(event) {
	setLanguage();
	var orderId = storeObject.orderNumber;
	storeObject.syncBtn = '';
	if (orderId) {
		getOrderDetails(orderId, "getOrderDetails");
	} /*else {
		$("#orderRowId").val("");
		$("#orderid").val("");
		$("#orderid").textinput("enable");
	}*/
});
$(document).on("pageshow", "#ordereditpage", function() {
	$.mobile.loading('hide');
});

// save orders button click
$(document).on("click", "#savebtn", function() {
	storeObject.syncBtn = '';
	saveCheckList();
});

// sync to server button click
$(document).on("click", "#sync", function(e) {
	storeObject.syncBtn = '1';
	saveCheckList();
});
// cancel button click
$(document).on("click","#cancel",function(e){
	storeObject.orderNumber = "";
	$.mobile.pageContainer.pagecontainer("change", "#listpage", {});
});

// on back press event
function onBackPressed() {
	document.addEventListener("backbutton",
			function(e) {
				if ($.mobile.activePage.is("#loginpage")) {
					navigator.app.exitApp();
				}
				if ($.mobile.activePage.is("#listpage")) {
					navigator.app.exitApp();
				}
				if ($.mobile.activePage.is("#ordereditpage")) {
					storeObject.orderNumber = "";
					var backConfirm = confirm(i18n.t("confirmsavemsg"));
					if (backConfirm) {
						storeObject.syncBtn = '';
						saveCheckList();
					} else {
						$.mobile.pageContainer.pagecontainer("change",
								"#listpage", {});
					}
				}
			});
}