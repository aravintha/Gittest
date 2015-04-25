// returned results from database
function returnQueryResults(results, string) {
	switch (string) {
	case "loggedinuser":
		returnLoggedUser(results);
		break;
	case "offlinelogin":
		offlinLogin(results);
		break;
	case "getOrderLists":
		orderLists(results);
		break;
	case "getOrderDetails":
		editOrderList(results);
		break;
	case "logout":
		returnLogoutStatus(results);
		break;
	case "syncOrders":
		constructOrderDetailsForSync(results);
		break;
	case "getordernumber":
		constructOrderNaumberArray(results);
		break;
	case "getmaximumdate":
		returnMaximumDate(results);
		break;
	case "returnMaxDate":
		getTemplateMaxDate(results);
		break;
	case "getAllTemplateName":
		displayTemplateName(results);
		break;
	case "getTemplateDetails":
		displayTemplateDetails(results);
		break;
	case "getTemplateFileName":
		downloadTemplate(results);
		break;
	case "getTemplateDetailsForSync":
		constructTemplateDetailsForSync(results);
		break;
	}

}