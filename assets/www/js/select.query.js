// check logged in user
function selectUser() {
	var userloggedQuery = " * from user where loggedin='1'";
	transactionSelect(userloggedQuery, "loggedinuser");
}
// get orders from database
function getOrderList(userId) {
	var orderTableQuery = " * FROM `order` where  user_id='" + userId
			+ "' order by edited_date desc";
	transactionSelect(orderTableQuery, "getOrderLists");
}
// get order details
function getOrderDetails(orderId,str) {
	var getOrderQuery = " * FROM `order` where order_id='"
			+ orderId + "'";
	transactionSelect(getOrderQuery, str);
}
// get template names
function getTemplateNames(companyId){
	var getTepmlateNames = " name FROM template where company_id='"+companyId+"'";
	transactionSelect(getTepmlateNames,"getAllTemplateName");
}
// get template details from DB
function getTemplateTableDetails(userId,orderId,str){
	var getTemplateDetailsQuery = " * FROM orderFileDetails where user_id='"+userId+"' and order_id='"+orderId+"'";
	transactionSelect(getTemplateDetailsQuery,str);
}