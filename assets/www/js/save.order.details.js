/**
 * save the order data's and sync the orders to server
 */
var orderArray, templateDetailsArray,templateFileArray;
// save check list data's
function saveCheckList() {
	var rowId = $("#rowId").val();
	var orderid = $("#orderid").html();
	var addedby = $("#addedby").html();
	var addedDate = $("#orderAddedDate").val();
	
	if (rowId) {
	} else {
		rowId = getRandomUdid();
	}
	var editedDate = getCurrentTime();
	if (addedDate) {
	} else {
		addedDate = getCurrentTime();
	}
	if (orderid) {
		if (storeObject.syncBtn) {
			showLoadingMessage(syncing);
		} else {
			showLoadingMessage(saveLocally);
		}
		userId = storeObject.userId;
		/*var insertQuery = "INSERT OR REPLACE INTO `order`(id,user_id,order_id,added_by,deleted,added_date,edited_date) values(?,?,?,?,?,?,?)";
		var insertValues = [ rowId, userId, orderid,addedby,"0",
		                              addedDate,editedDate ];
		transactionInsert(insertQuery, insertValues);*/
		var editedDate = getCurrentTime();
		
		var updateOrderQuery = "`order` set edited_date=? where order_id=?";
		var updateValues = [editedDate,orderid];
		transactionUpdateWithValue(updateOrderQuery, updateValues,"");
		insertTemplateTableValues(userId);
	} 
	
}
// template table values
function insertTemplateTableValues(userId){
	
	var orderid = $("#rowId").val();
	
	var templateTableRowCount = $("#templateTableRowCount").val();
	for ( var i = 0; i < templateTableRowCount; i++) {
		var k = i + 1;
		var templateName = $("#formname" + k).html();
		var templateCode = $("#templateCode" + k).val();
		var addedby = $("#addedby"+k).val();
		var filename = $("#fullfileJSON" + k).html();
		var deleted = $("#templatedeleted" + k).val();
		var templateRowId = $("#templaterowid" + k).val();
		var templateRowAddedDate = $("#templateaddeddate" + k).val();
		if (templateRowId) {
		} else {
			templateRowId = getRandomUdid();
		}
		if (deleted == "1") {
		} else {
			deleted = "0";
		}
		
		var modifiedDate = getCurrentTime();
		
		if (templateRowAddedDate) {
		} else {
			templateRowAddedDate = modifiedDate;
		}
		
		if (templateCode) {
			var insertQuery = "INSERT OR REPLACE INTO orderFileDetails(id ,user_id,added_by,order_id,template_code,name,file,deleted,added_date,edited_date) values(?,?,?,?,?,?,?,?,?,?)";
			var insertValues = [ templateRowId, userId,addedby, orderid,
					templateCode, templateName, filename, deleted, templateRowAddedDate,
					modifiedDate];
			transactionInsert(insertQuery, insertValues);
		}
	}
	
	
	if (storeObject.syncBtn) {
		getValuesForSync();
	} else {
		setTimeout(function() {
			storeObject.orderNumber = "";
			$.mobile.loading('hide');
			$.mobile.pageContainer.pagecontainer("change", "#listpage", {});
		}, 2000);
	}
}

// sync
function getValuesForSync() {
	var orderid = $("#rowId").val();
	getOrderDetails(orderid, "syncOrders")
}
// construct machine values array
function constructOrderDetailsForSync(results) {
	orderArray = "";
	
	if (results.rows.length > 0) {
		var editedDate = results.rows.item(0).edited_date;
		if (results.rows.item(0).edited_date.toString().indexOf('-') > 0) {
		}else{
			var date = new Date(parseInt(results.rows.item(0).edited_date));
			editedDate = date.format("yyyy-mm-dd HH:MM:ss");
		}
		
		orderArray = {
			"id":results.rows.item(0).id,
			"order_id" : results.rows.item(0).order_id,
			"user_id":results.rows.item(0).user_id,
			"added_by":escapeSpecialChars(encodeURIComponent(results.rows.item(0).added_by)),
			"added_date":results.rows.item(0).added_date,
			"edited_date":editedDate,
			"status":"COMPLETED"
		};
		
		//var orderId = $("#orderid").html();
		var rowId = $("#rowId").val();
		getTemplateTableDetails(storeObject.userId,rowId,"getTemplateDetailsForSync");
	}

}
// array for template details
function constructTemplateDetailsForSync(results){
	templateDetailsArray = [];
	templateFileArray = [];
	var checkFileSizeCount = 0;
	var orderFilesDetailsLength = results.rows.length;
	var result = "";
	if(results.rows.length > 0 ){
		result = results;
	}
	var findFileSizeCount = 0;
	if(result){
	if(result.rows.length > 0){
		for(var i = 0 ; i < result.rows.length;i++){
			
			var newData = result.rows.item(i).file;
			if(newData){
				var orderFileJSON = eval('('+ result.rows.item(i).file+ ')');
				var filename = /[^/]*$/.exec(orderFileJSON[0].name)[0];
				templateFileArray.push(filename);
					//customPlugin.createEvent(function(fileSize) {
				
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFLS(fileSystem) {
					var root = fileSystem.root.toURL();
					
					
					window.resolveLocalFileSystemURI(root+TEMPLATE_FILE_DIRECTORY+"/"+templateFileArray[findFileSizeCount], function(fileEntry){
												
						fileEntry.file(function(fileObj) { 
							
							fileSize = fileObj.size;
						var orderFileJSON = eval('('+ result.rows.item(checkFileSizeCount).file+ ')');
						
						var filename = /[^/]*$/.exec(orderFileJSON[0].name)[0];
						var fileArray = [];
						fileArray.push({
							"name" : "files/pdf/"+filename,
							"usrName" : orderFileJSON[0].usrName,
							"size" : fileSize,
							"type":"application/pdf",
							"searchStr":filename
						});
						fileDetails = JSON.stringify(fileArray);
						
						var edit_date = new Date(result.rows.item(checkFileSizeCount).edited_date);
						var editedDate = edit_date.format("yyyy-mm-dd HH:MM:ss");
						
						var addedDate = result.rows.item(checkFileSizeCount).added_date;
						if (result.rows.item(checkFileSizeCount).added_date.toString().indexOf('-') > 0) {
						}else{
							var date = new Date(parseInt(result.rows.item(checkFileSizeCount).added_date));
							addedDate = date.format("yyyy-mm-dd HH:MM:ss");
						}
						templateDetailsArray.push({
							"id":result.rows.item(checkFileSizeCount).id,
							"user_id":result.rows.item(checkFileSizeCount).user_id,
							"added_by":escapeSpecialChars(encodeURIComponent(result.rows.item(checkFileSizeCount).added_by)),
							"order_id":result.rows.item(checkFileSizeCount).order_id,
							"template_code":result.rows.item(checkFileSizeCount).template_code,
							"name":escapeSpecialChars(encodeURIComponent(result.rows.item(checkFileSizeCount).name)),
							"file":fileDetails,
							"deleted":result.rows.item(checkFileSizeCount).deleted,
							"added_date":addedDate,
							"edited_date":editedDate
							});
						checkFileSizeCount++;
						if(orderFilesDetailsLength == checkFileSizeCount){
							setTimeout(function(){
								startSyncToServer();
							},2000);
						}
					/*},fileSizeFail, "FILE_SIZE", {
						"destination" : TEMPLATE_FILE_DIRECTORY,
						"filename" : filename
					});*/
						},fail);
					});
					findFileSizeCount++;
				}, fail);
			}else{
				templateDetailsArray.push({
					"id":result.rows.item(i).id,
					"user_id":result.rows.item(i).user_id,
					"added_by":escapeSpecialChars(encodeURIComponent(result.rows.item(i).added_by)),
					"order_id":result.rows.item(i).order_id,
					"template_code":result.rows.item(i).template_code,
					"name":escapeSpecialChars(encodeURIComponent(result.rows.item(i).name)),
					"file":fileDetails,
					"deleted":result.rows.item(i).deleted,
					"added_date":addedDate,
					"edited_date":editedDate
					});
				
					setTimeout(function(){
						startSyncToServer();
					},2000);
			}
		}
	}
	} else {
		startSyncToServer();
	}
	
}

function fileSizeFail(e){
	console.log(e);
}
// sync data's to the server
function startSyncToServer() {
	$.mobile.loading('hide');
	connectionStatus = navigator.onLine ? 'online' : 'offline';
	if (connectionStatus == "offline") {
		commonI18init("syncOffline");
	} else {
		var orderid = $("#orderid").html();
		
		var newdata = {
			'order_id' : orderid,
			'orderDetails' : orderArray,
			'orderFileDetails':templateDetailsArray
		};
		var params = "service=update&user_id=" + storeObject.userId
				+ "&order_id=" + orderid + "&data="
				+ JSON.stringify(newdata);
		
		createLogFile(params);
		uploadTemplateFiles();
		callServer(DATA_URL, params, METHOD, checkUpdated);
	}
}
// response from server after sync
function checkUpdated(response) {
	var opts = eval('(' + response + ')');
	if (opts.status == "success") {
		//var orderid =$("#orderid").html();
		var orderid = $("#rowId").val();
		transactionDelete(" `order` where id='"+orderid+"'");
		//console.log("orderFileDetails where order_id='"+orderid+"'");
		transactionDelete(" orderFileDetails where order_id='"+orderid+"'");
		setTimeout(function() {
			storeObject.orderNumber = "";
			$.mobile.loading('hide');
			$.mobile.pageContainer.pagecontainer("change", "#listpage", {});
		}, 2000);
	} else {
		alert("Upload error :" +opts.results);
	}
}
// upload checkilist file
function uploadTemplateFiles(){
	if(templateFileArray.length > 0){
		templateFileArrayCount = templateFileArray.length;
		
		showLoadingMessage("file upload");
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFLS(fileSystem) {
			var root = fileSystem.root.toURL();
		for(i = 0;i < templateFileArray.length;i++){
			var options = new FileUploadOptions();
		    options.fileKey = "file";
		    options.fileName = templateFileArray[i]/*"test.pdf"*/;
		    options.mimeType = "application/pdf";
		    options.headers = {
		    		Connection: "close"
		    	};
		    options.chunkedMode = false;
		    var params = {};
		    params.filePath = "files/pdf/";
		    options.params = params;
		    uploadFiles(root+""+TEMPLATE_FILE_DIRECTORY+"/"+templateFileArray[i],FILE_UPLOAD_URL,options);
		}
		},fail);
	}
}