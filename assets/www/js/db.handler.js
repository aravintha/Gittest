/**
 * database handler query for select, update, delete and insert. 
 * return the query results to query.results.js
 */
var db;
var selectString,updateString;
// initialize the database
function initDatabase() {
	db = window.openDatabase(DATABASE_NAME, DATABASE_VERSION, DATABASE_NAME,
			DATABASE_SIZE);
}
// for select transaction
function transactionSelect(query, str) {
	initDatabase();
	selectString = str;
	db.transaction(function(tx) {
		tx.executeSql("SELECT " + query, [], returnSelectSuccess);
	});
}
// return select query success
function returnSelectSuccess(t, results) {
	returnQueryResults(results, selectString);
}
// for create transaction
function transactionCreate(query) {
	initDatabase();
	db.transaction(function(tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS " + query);
	});

}
// for insert transaction
function transactionInsert(query, values) {
	initDatabase();
	db.transaction(function(tx) {
		tx.executeSql(query, values);
	});
}

// for update transaction 
function transactionUpdate(query,str){
	initDatabase();
	updateString = str;
	db.transaction(function(tx){
		tx.executeSql("UPDATE "+query,[],returnUpdateSuccess);
	});
}
// for update
function transactionUpdateWithValue(query,value,str){
	initDatabase();
	updateString = str;
	db.transaction(function(tx){
		tx.executeSql("UPDATE "+query,value,returnUpdateSuccess);
	});
}
// update success
function returnUpdateSuccess(t,results){
	returnQueryResults(results, updateString);
}
// transaction delete
function transactionDelete(query){
	initDatabase();
	db.transaction(function(tx){
		tx.executeSql(" DELETE FROM " +query);
	});
}
function success(e) {
	alert("success");
}
function error(e) {
	alert(JSON.stringify(e));
	alert(e.code);
}
