/**
 * initialize the data i18n language
 */
// set language path
function setLanguage() {
	var language = localStorage.getItem("TemplateLanguage");
	if (language) {
		path = 'language/' + language + '/translation.json';
		var activePage = $.mobile.activePage.attr("id");
		if (activePage == "loginpage") {
			var displaySelect = $("select#selectlanguage");
			displaySelect.val(language);
			displaySelect.selectmenu("refresh");
		}
	} else {
		path = 'language/norway/translation.json';
	}
	callLanguage(path);
}

// callLanguage
function callLanguage(path) {
	var browserLanguage = navigator.language || navigator.userLanguage;
	var option = {
		lng : browserLanguage,
		resGetPath : path,
		fallbackLng : 'en-US'
	};
	$.i18n.init(option, function(t) {
		$('body').i18n();
		syncing = t("syncing");
		saveLocally = t("savelocally");
		loginmsg = t("loginmsg");
		logoutmsg = t("logoutmsg");
		logoutTxt = t("logout");
		deleteMsg = t("confirmdelete");
		toggleColumnText = t("showcolumn");
		openorderDetails = t("openorderdetails");
		orderReceiveLang = t("orderReceived");
		projectLang = t("projectCount");
		fileDownloadMsg = t("filedownloadmsg");
		getDatasFromServerMsg = t("getDatasFromServerMsg");
	});
}

// select language
function selectLangauge() {
	lang = $("#selectlanguage").val();
	localStorage.setItem("TemplateLanguage", lang);
	path = 'language/' + lang + '/translation.json';
	callLanguage(path);
}

// dynamic internalization call
function commonI18init(data) {
	i18n.init(function(t) {
		var message = t(data);
		alert(message);
	});
}
