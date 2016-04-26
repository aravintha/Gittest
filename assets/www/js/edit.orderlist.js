/**
 * show edited order values in fields, clone order table and comment table
 */
var templateTitleArray = [];
var templateTableRowId = "1";
var selectTemplateId;
// display order details
function editOrderList(results) {

	if (results.rows.length > 0) {
		$("#rowId").val(results.rows.item(0).id);
		$("#orderAddedDate").val(results.rows.item(0).added_date);
		$("#orderid").html(results.rows.item(0).order_id);
		$("#addedby").html(results.rows.item(0).added_by);
		$("#contact").html(results.rows.item(0).contact);
		$("#phonenumber").html(results.rows.item(0).phone_number);
		$("#phonenumber").attr("href", "tel:"+results.rows.item(0).phone_number);
		$("#status").html(results.rows.item(0).status);
		if(results.rows.item(0).deadline){
			$("#deadline").html(results.rows.item(0).deadline);
		}
		
	}
	companyId = storeObject.companyId;
	getTemplateNames(companyId);
}
// display template name (in select option)
function displayTemplateName(results) {

	templateTitleArray = [];
	if (results.rows.length > 0) {
		for ( var i = 0; i < results.rows.length; i++) {
			templateTitleArray.push(results.rows.item(i).name);
		}
	}
	templateTableRowId = "1";
	var orderId = storeObject.orderNumber;
	userId = storeObject.userId;
	var id = $("#rowId").val();
	getTemplateTableDetails(userId, id, "getTemplateDetails");

}
// display template details in table
function displayTemplateDetails(results) {
	$("#templatetable").find("tr:gt(0)").remove();
	if (results.rows.length > 0) {
		for ( var i = 0; i < results.rows.length; i++) {
			cloneTemplateTable("");
			var k = i + 1;
			$("#formname" + k).html(results.rows.item(i).name);
			$("#addedby" + k).val(results.rows.item(i).added_by);
			$("#templateCode" + k).html(results.rows.item(i).template_code);
			$("#fullfileJSON" + k).html(results.rows.item(i).file);
			if(results.rows.item(i).file){
				var orderFileJSON = eval('('+ results.rows.item(i).file + ')');
				var filename = /[^/]*$/.exec(orderFileJSON[0].name)[0];
				$("#filename"+k).html(filename);
				$("#randomFileName"+k).html(orderFileJSON[0].usrName);
			}
			
			$("#templatedeleted" + k).val(results.rows.item(i).deleted);
			$("#templaterowid" + k).val(results.rows.item(i).id);
			$("#templateaddeddate" + k).val(results.rows.item(i).added_date);
			// alert(results.rows.item(i).deleted);
			if (results.rows.item(i).deleted == "1") {
				$("#templatedelete" + k).parent().parent().hide();
			}
		}
	}
}
// clone template table
function cloneTemplateTable(param) {

	var templateTableClone = '<tr><td><input type=hidden id=templatedeleted'
			+ templateTableRowId + '><input type=hidden id=addedby'
			+ templateTableRowId + '>';
	if (param) {
		templateTableClone += '<select id=tempName'
				+ templateTableRowId
				+ ' onchange=getTempate(this.id);><option>'+i18n.t("selectTemplate")+'</option>';
		for ( var i = 0; i < templateTitleArray.length; i++) {
			templateTableClone += "<option>" + templateTitleArray[i]
					+ "</option>";
		}
	} else {

		templateTableClone += '<img src="img/pdficon.png" style="float:left;" id=pdficone'
				+ templateTableRowId
				+ ' onclick="openFile(this.id);"></img><label style="margin-left:15%;" id=formname'
				+ templateTableRowId + ' onclick=openFile(this.id);></label>';
	}
	templateTableClone += '</select></td><td><label id=templateCode'
			+ templateTableRowId
			+ ' ></label><input type=hidden id=templaterowid'
			+ templateTableRowId
			+ '></td>'
			+ ' <td><label id=filename'
			+ templateTableRowId
			+ ' style="display:none;"></label><label id=randomFileName'+templateTableRowId+'></label><label id=fullfileJSON'+templateTableRowId+' style="display:none;"></label><input type=hidden readonly=readonly id=templateaddeddate'
			+ templateTableRowId
			+ '></td><td><a id=templatedelete'
			+ templateTableRowId
			+ ' class="ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-corner-all ui-shadow" onclick=deleteTableRows(this,"templatetable","orderFileDetails",this.id)></a></td></tr>';

	$("#templatetableheader").after(templateTableClone).parent().trigger(
			"create");
	$("#select#tempName" + templateTableRowId).selectmenu("refresh");
	$("#templateTableRowCount").val(templateTableRowId);
	templateTableRowId++;
}

// delete template table rows in UI
function deleteTableRows(deleteId, tableName, DBtable, tableRow) {

	var deleteVal = confirm(deleteMsg);
	if (deleteVal) {
		var i = deleteId.parentNode.parentNode.rowIndex;
		var row = document.getElementById(tableName);

		$(deleteId).parent().parent().hide();

		var databaseColumn;
		if (tableName == "templatetable") {
			// $(deleteId).closest('tr').find('td:eq(0) input').val("1");
			var splitDeleteId = tableRow.split("e");
			var templateRowId = $("#templaterowid" + splitDeleteId[5]).val();
			var updateQuery = DBtable + " set deleted ='1' where id='"
					+ templateRowId + "'";
			transactionUpdate(updateQuery, "");
		}
	}
}

// get template name when select
function getTempate(id) {
	selectTemplateId = id;
	var templatename = $("#" + id).val();
	var getFileNameQuery = " * FROM template where name='" + templatename + "'";
	transactionSelect(getFileNameQuery, "getTemplateFileName");
}
// download template
function downloadTemplate(results) {
	var rowId = selectTemplateId.split("e");

	if (results.rows.length > 0) {
		var fileArray = [];
		var pos = results.rows.item(0).file.lastIndexOf('.');
		var orderId = storeObject.orderNumber;
		var fileName = results.rows.item(0).file;
		var randomFileName = orderId + "_"
				+ results.rows.item(0).file.substring(0, pos) + getRandomName(6)
				+ "." + results.rows.item(0).file.substring(pos + 1);
		/*customPlugin.createEvent(returnFileDownlodSuccess, fileDownloadFail,
				"local", {
					"source" : TEMPLATE_DIRECTORY + "/" + fileName,
					"newfilename" : randomFileName,
					"destination" : TEMPLATE_FILE_DIRECTORY
				});*/
		//saveFiles(TEMPLATE_DIRECTORY + "/" + fileName,randomFileName,TEMPLATE_FILE_DIRECTORY);
		
		window.requestFileSystem = window.requestFileSystem
		|| window.webkitRequestFileSystem;

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFile(
				fileSystem) {
			var root = fileSystem.root.toURL()
			fileSystem.root.getDirectory(TEMPLATE_FILE_DIRECTORY, {
				create : true
			}, function fileSystemSuccess(fileSystem) {
				fileSystem.getFile("dummy.txt", {
					create : true,
					exclusive : false
				}, function gotFileEntry(fileEntry) {
					var path = fileSystem.fullPath;
					fileEntry.remove();
					var fileTransfer = new FileTransfer();
					
					fileTransfer.download(root+TEMPLATE_DIRECTORY + "/" + fileName, root+""
							+ TEMPLATE_FILE_DIRECTORY + "/" + randomFileName, function(theFile) {
												
						showLoadingMessage(fileDownloadMsg);
						$("#templaterowid" + rowId[2]).val(getRandomUdid);

						$("#templateCode" + rowId[2]).html(
								results.rows.item(0).code);
						//$("#filename" + rowId[2]).html(randomFileName);
						var templateName = results.rows.item(0).name;
						var templateCode = $("#templateCode" + rowId[2]).html();
						var order_id = $("#orderid").html();
						fileArray.push({
							"name" : "files/pdf/"+randomFileName,
							"usrName" : fileName,
							"size" : theFile.size,
							"type":"application/pdf",
							"searchStr":fileName
						});
						var newData = {
								"file" : fileArray
						};
						
						$("#fullfileJSON" + rowId[2]).html(JSON.stringify(fileArray));
						
						var filename = $("#fullfileJSON" + rowId[2]).html();
						$("#filename"+rowId[2]).html(randomFileName);
						var deleted = $("#templatedeleted" + rowId[2]).val();
						var templateRowId = $("#templaterowid" + rowId[2]).val();
						var templateRowAddedDate = $("#templateaddeddate" + rowId[2]).val();
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
						userId = storeObject.userId;
						var id = $("#rowId").val();
						var insertQuery = "INSERT OR REPLACE  INTO orderFileDetails(id ,user_id,added_by,order_id,template_code,name,file,deleted,added_date,edited_date) values(?,?,?,?,?,?,?,?,?,?)";
						var insertValues = [ templateRowId, userId, userId, id,
								templateCode, templateName, filename, deleted,
								templateRowAddedDate, modifiedDate ];
						transactionInsert(insertQuery, insertValues);
						var editedDate = getCurrentTime();
						
						var updateOrderQuery = "`order` set edited_date=? where order_id=?";
						var updateValues = [editedDate,orderId];
						transactionUpdateWithValue(updateOrderQuery, updateValues,"");

						setTimeout(function() {
							$.mobile.loading('hide');
							$.mobile.changePage("#ordereditpage", {
								allowSamePageTransition : true,
								transition : 'none'
							});
						}, 2000);
						
					}, function(e) {
						alert("fileTransferFail" + JSON.stringify(e));
					});
				}, fail);
			});
		}, fail);
		// file download success
		//function returnFileDownlodSuccess(fileDownloadResult) {
			/*
			
			showLoadingMessage(fileDownloadMsg);
			$("#templaterowid" + rowId[2]).val(getRandomUdid);

			$("#templateCode" + rowId[2]).html(
					results.rows.item(0).code);
			//$("#filename" + rowId[2]).html(randomFileName);
			var templateName = results.rows.item(0).name;
			var templateCode = $("#templateCode" + rowId[2]).html();
			
			fileArray.push({
				"name" : "files/pdf/"+randomFileName,
				"usrName" : orderId+"_"+templateCode+"_"+getRandomName(3),
				"size" : fileDownloadResult,
				"type":"application/pdf",
				"searchStr":randomFileName
			});
			var newData = {
					"file" : fileArray
			};
			
			$("#fullfileJSON" + rowId[2]).html(JSON.stringify(fileArray));
			var filename = $("#fullfileJSON" + rowId[2]).html();
			$("#filename"+rowId[2]).html(randomFileName);
			var deleted = $("#templatedeleted" + rowId[2]).val();
			var templateRowId = $("#templaterowid" + rowId[2]).val();
			var templateRowAddedDate = $("#templateaddeddate" + rowId[2]).val();
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
			userId = storeObject.userId;
			var insertQuery = "INSERT OR REPLACE  INTO orderFileDetails(id ,user_id,added_by,order_id,template_code,name,file,deleted,added_date,edited_date) values(?,?,?,?,?,?,?,?,?,?)";
			var insertValues = [ templateRowId, userId, userId, orderId,
					templateCode, templateName, filename, deleted,
					templateRowAddedDate, modifiedDate ];
			transactionInsert(insertQuery, insertValues);
			var editedDate = getCurrentTime();
			
			var updateOrderQuery = "`order` set edited_date=? where order_id=?";
			var updateValues = [editedDate,orderId];
			transactionUpdateWithValue(updateOrderQuery, updateValues,"");

			setTimeout(function() {
				$.mobile.loading('hide');
				$.mobile.changePage("#ordereditpage", {
					allowSamePageTransition : true,
					transition : 'none'
				});
				// $.mobile.pageContainer.pagecontainer( "change",
				// "#ordereditpage", {reload: true,reloadPage: true} );
				// $.mobile.pageContainer.pagecontainer( "change",
				// "#ordereditpage", { allowSamePageTransition:true,reload:
				// true} );
			}, 2000);
		*///}
	}
}

// open template pdf files to view
function openFile(id) {
	
	var formTitleId = id.split('e');
	var templateName = $("#filename" + formTitleId[1]).html();
		
	var fileName = "/sdcard/" + TEMPLATE_FILE_DIRECTORY + "/" + templateName;
	customPlugin.createEvent("", fileException, "fileopen", {
		"filename" : fileName,
		"type" : 'application/pdf'
	});
	/*
	 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
	fileName = fileSystem.root.toURL()+TEMPLATE_FILE_DIRECTORY+"/"+templateName;
	
	cordova.plugins.fileOpener2.open(decodeURIComponent(fileName),
    'application/pdf', 
    { 
        error : function(e) { 
            alert('Error status: ' + e.status + ' - Error message: ' + e.message);
        },
        success : function () {
                         
        }
    }
	);
	}, function(){
			alert("fails!");
	});
	  */
}
// file open exception
function fileException(e) {
	alert(JSON.stringify(e));
}