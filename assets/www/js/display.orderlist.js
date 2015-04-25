/**
 * display the order details in list page (in listview)
 * 
 * @param results
 */
// display check list from database
function orderLists(results) {
	if (results.rows.length > 0) {
		var checkLists = "";
		for ( var i = 0; i < results.rows.length; i++) {
			checkLists += '<li id="'
					+ results.rows.item(i).order_id
					+ '" data-icon="false" onclick="edit(this.id);"><b>'+i18n.t("orderid")+'</b>'+ results.rows.item(i).order_id+' '
					+'<p><font size="3"><b>'+i18n.t("address")+ '</b>'+results.rows.item(i).address+'<b class="listPadding">'+i18n.t("status") +'</b>'+results.rows.item(i).status+'</font></p></li>';
		}
		$("#orderlistview").html(checkLists);
		$("#orderlistview").listview("refresh");
	} else {
		$("#orderlistview").html("<p>No Datas found</p>");
	}
}
// store the clicked id and redirect to order edit page (edit page)
function edit(orderId) {
	storeObject.orderNumber = orderId;
	$.mobile.pageContainer.pagecontainer("change", "#ordereditpage", {});
	showLoadingMessage(openorderDetails);
}