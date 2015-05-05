package com.processdrive.offlinepdf;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.DatabaseErrorHandler;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteDatabase.CursorFactory;
import android.database.sqlite.SQLiteException;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Environment;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.webkit.MimeTypeMap;

/**
 * 
 * @author processdrive get the edited order from database and sync the
 *         edited orders to the server.
 */

@SuppressWarnings("deprecation")
@SuppressLint({ "SdCardPath", "SimpleDateFormat" })
public class DatabaseHandler {
	SQLiteDatabase db;

	final String APP_NAME = "offlinepdf";
	final String FOLDER_NAME = "offlinepdf";
	final String DIRECTOTY_SEPARATOR = "/";
	//public static String BASE_URL = "http://192.168.1.4/offline-pdf/";
	public static String BASE_URL = "http://checklist.solutionapp.no/";

	String templateFileDir = DIRECTOTY_SEPARATOR.concat(FOLDER_NAME).concat(
			"/pdf/");

	String DB_BASE_PATH = "/data/data/com.processdrive.".concat(APP_NAME);
	String DB_PATH_18 = "/app_webview/databases/file__0/";
	String DB_PATH_17 = "/app_database/file__0/";
	String DB_PATH = "";
	String order_id = "";
	String fileSendUrl = BASE_URL.concat("offline_pdf_apiupload.php");
	public static String dataSendUrl = BASE_URL.concat("offline_pdf_apiservice.php");

	Long lastSyncDate;
	Boolean checkSuccess = false;
	Boolean checkDatabaseSuccess = false;
	Boolean checkEditedOrders = false;

	String[] orderNumberArray;
	String userId;
	HashMap<String, Object> orderDetailHashmap;
	HashMap<String, Object> orderHashMap;

	ArrayList<HashMap<String, Object>> orderDetailAL;
	String[] costFileArray;
	ArrayList<String> templateFileAL;
	private Context context;
	String DB_NAME;
	ArrayList<String> skiID;
	String identifier = null;
	boolean backupSuccess = false;

	public DatabaseHandler(Context context, String name, CursorFactory factory,
			float version, DatabaseErrorHandler errorHandler) {
		this.context = context;
		// String PACKAGE_NAME = context.getPackageName();
		checkDataBase();
	}

	// check database is present
	public boolean checkDataBase() {
		try {
			SQLiteDatabase checkDataBase = null;

			int sdkVersion = android.os.Build.VERSION.SDK_INT;
			if (sdkVersion > 18) {
				DB_PATH = DB_BASE_PATH.concat(DB_PATH_18);
				File f = new File(DB_PATH);
				File file[] = f.listFiles();

				for (int i = 0; i < file.length; i++) {
					DB_NAME = file[i].getName();
					if (DB_NAME.contains(".")) {
						continue;
					} else {
						try {
							String Path = DB_PATH + DB_NAME;
							File dbFile = new File(Path);
							if (dbFile.exists()) {
								checkDataBase = SQLiteDatabase.openDatabase(
										Path, null,
										SQLiteDatabase.OPEN_READONLY);
								checkDatabaseSuccess = true;
								Log.e("CheckDb", "DB");
								break;
							}
						} catch (SQLiteException e) {
							Log.e("CheckDb", "DB not found");
						}
					}
				}
			} else {
				DB_PATH = DB_BASE_PATH.concat(DB_PATH_17);
				DB_NAME = "0000000000000001.db";
				try {
					String Path = DB_PATH + DB_NAME;
					File dbFile = new File(Path);
					if (dbFile.exists()) {
						checkDataBase = SQLiteDatabase.openDatabase(Path, null,
								SQLiteDatabase.OPEN_READONLY);
						checkDatabaseSuccess = true;
					}
				} catch (SQLiteException e) {
					Log.e("CheckDb", "DB not found");
				}
			}

			return checkDataBase != null ? true : false;
		} catch (Exception e) {

		}
		return checkDatabaseSuccess;
	}
	// open the database
	public void openDataBase() throws SQLException {

		String path = DB_PATH + DB_NAME;
		db = SQLiteDatabase.openDatabase(path, null, 0);
	}
	// get modified order count
	public int getModifiedOrderCount() {
		getLoggedInUser();
		return getOrderCount();
	}

	// get the logged in user
	public void getLoggedInUser() {
		openDataBase();
		String sqlQuery = "SELECT user_id,lastsyncdate FROM user WHERE loggedin='1'";
		Cursor cursor = db.rawQuery(sqlQuery, null);
		
		if (cursor != null && cursor.getCount() > 0) {
			cursor.moveToFirst();
			do {
				userId = cursor.getString(cursor.getColumnIndex("user_id"));
				lastSyncDate = cursor.getLong(cursor
						.getColumnIndex("lastsyncdate"));
			} while (cursor.moveToNext());
		}
	}

	// get edited orders
	public int getOrderCount() {
		int orderCount = 0;
		String query = "SELECT order_id,edited_date FROM `order` where user_id=\'"
				+ userId + "\'";
		Cursor cursor = db.rawQuery(query, null);
		orderNumberArray = new String[cursor.getCount()];

		if (cursor != null && cursor.getCount() > 0) {
			cursor.moveToFirst();

			do {
				orderNumberArray[cursor.getPosition()] = cursor.getString(0);
				long editDate = cursor.getLong(cursor
						.getColumnIndex("edited_date"));
				if (editDate > lastSyncDate) {
					orderCount++;
				}
			} while (cursor.moveToNext());
		}
		return orderCount;
	}

	// backup orders
	public boolean backupOrders() {
		boolean result = false;
		try {
			TelephonyManager tm = (TelephonyManager) context
					.getSystemService(Context.TELEPHONY_SERVICE);
			if (tm != null)
				identifier = tm.getDeviceId();
			String query = "SELECT * FROM `order` where user_id=\'"
					+ userId + "\'";
			Cursor cursor = db.rawQuery(query, null);
			orderNumberArray = new String[cursor.getCount()];
			if (cursor != null && cursor.getCount() > 0) {
				cursor.moveToFirst();

				do {
					orderHashMap = new HashMap<String, Object>();
					orderNumberArray[cursor.getPosition()] = cursor
							.getString(cursor.getColumnIndex("order_id"));
					Long editDate = cursor.getLong(cursor
							.getColumnIndex("edited_date"));
					if (editDate > lastSyncDate) {
						checkEditedOrders = true;
						orderHashMap.put("id",
								cursor.getString(cursor.getColumnIndex("id")));
						orderHashMap.put("order_id", cursor.getString(cursor
								.getColumnIndex("order_id")));
						orderHashMap.put("user_id", cursor.getString(cursor
								.getColumnIndex("user_id")));
						orderHashMap.put("added_by", cursor.getString(cursor
								.getColumnIndex("added_by")));
						orderHashMap.put("added_date", cursor.getString(cursor
								.getColumnIndex("added_date")));
						long editedDate = cursor.getLong(cursor
								.getColumnIndex("edited_date"));
						String date = getDate(editedDate,
								"yyyy-MM-dd kk:mm:ss");
						Log.e("edit date", date);
						orderHashMap.put("edited_date", date);
						order_id = cursor.getString(cursor
								.getColumnIndex("order_id"));
						String orderRowId = cursor.getString(cursor.getColumnIndex("id"));
						getTemplateValues(orderRowId);
					}
				} while (cursor.moveToNext());
			} else {
				if (db.isOpen()) {
					Log.e("db open", "db open");
				}
			}
			result = true;
		} catch (Exception e) {
			Log.e("order exception", String.valueOf(e.getMessage()));
		}
		return result;
	}

	// get template details table values
	public void getTemplateValues(String orderId) {

		String query = "SELECT * FROM orderFileDetails WHERE order_id=\'"
				+ orderId + "\'";
		Cursor cursor = db.rawQuery(query, null);
		orderDetailAL = new ArrayList<HashMap<String, Object>>();
		templateFileAL = new ArrayList<String>();
		if (cursor != null && cursor.getCount() > 0) {
			cursor.moveToFirst();

			do {
				orderDetailHashmap = new HashMap<String, Object>();
				orderDetailHashmap.put("id",
						cursor.getString(cursor.getColumnIndex("id")));
				orderDetailHashmap.put("user_id",
						cursor.getString(cursor.getColumnIndex("user_id")));
				orderDetailHashmap.put("added_by",
						cursor.getString(cursor.getColumnIndex("added_by")));
				orderDetailHashmap.put("order_id",
						cursor.getString(cursor.getColumnIndex("order_id")));
				orderDetailHashmap.put("template_code", (cursor
						.getString(cursor.getColumnIndex("template_code"))));
				orderDetailHashmap.put("name", encodeURIComponent(cursor
						.getString(cursor.getColumnIndex("name"))));
				try {
					//Log.e("Log", String.valueOf(fileJson));
					JSONArray fileDetailArray = new JSONArray(cursor.getString(cursor.getColumnIndex("file")));
					JSONObject jsonObject = (JSONObject)fileDetailArray.getJSONObject(0);
					String filePath = jsonObject.getString("name");
					
					String[] fileArray = filePath.split("/");
					String filename = fileArray[fileArray.length-1];
					templateFileAL.add(filename);
					
					String fileSize = getFileSize(templateFileDir,filename);
					JSONObject fileObject = new JSONObject();
					fileObject.put("name", filePath);
					fileObject.put("usrName", jsonObject.getString("usrName"));
					fileObject.put("size", fileSize);
					fileObject.put("type","application/pdf");
					fileObject.put("searchStr",filename);
					
					JSONArray fileJSONArray = new JSONArray();
					fileJSONArray.put(fileObject);
					orderDetailHashmap.put("file",fileJSONArray.toString());
					
				} catch (JSONException e) {
					e.printStackTrace();
				}

				orderDetailHashmap.put("deleted", encodeURIComponent(cursor
						.getString(cursor.getColumnIndex("deleted"))));

				long addedDateInMillis = cursor.getLong(cursor
						.getColumnIndex("added_date"));
				String addedDate = cursor.getString(cursor
						.getColumnIndex("added_date"));
				if (addedDate.indexOf("-") > 0) {
				} else {
					addedDate = getDate(addedDateInMillis,
							"yyyy-MM-dd kk:mm:ss");
				}
				orderDetailHashmap
						.put("added_date", (addedDate));
				String editedDate = getDate(cursor
						.getLong(cursor.getColumnIndex("edited_date")),
						"yyyy-MM-dd kk:mm:ss");
				Log.e("date from db", String.valueOf(cursor
						.getLong(cursor.getColumnIndex("edited_date"))));
				Log.e("editeddate", editedDate);
				orderDetailHashmap.put("edited_date",
						(editedDate));

				orderDetailAL.add(orderDetailHashmap);
				

			} while (cursor.moveToNext());
		}
		syncToServer(orderId);
	}

	// start sync to server
	public void syncToServer(String orderId) {

		if (checkInternetConnection()) {

			Log.e("synced order", orderId);
			HashMap<String, Object> data = new HashMap<String, Object>();
			Log.e("ord",order_id);
			data.put("order_id", order_id);
			data.put("orderDetails", orderHashMap);
			data.put("orderFileDetails", orderDetailAL);
			JSONObject jObj = new JSONObject(data);
			HttpClient httpclient = new DefaultHttpClient();

			HttpPost httppost = new HttpPost(dataSendUrl);
			
			httppost.setHeader("Accept-Charset", "utf-8");

			// upload order files
			if (templateFileAL != null) {
				getFileAndUpload(templateFileAL, templateFileDir, "files/pdf/");
			}

			templateFileAL = new ArrayList<String>();

			try {
				List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(
						2);
				nameValuePairs.add(new BasicNameValuePair("service", "update"));
				nameValuePairs.add(new BasicNameValuePair("backup", "1"));
				nameValuePairs
						.add(new BasicNameValuePair("user_id", userId));
				nameValuePairs.add(new BasicNameValuePair("order_id", order_id));
				nameValuePairs.add(new BasicNameValuePair("data", jObj
						.toString()));
				nameValuePairs.add(new BasicNameValuePair("imei", identifier));
				createLogFile(nameValuePairs);
				httppost.setEntity(new UrlEncodedFormEntity(nameValuePairs,
						HTTP.UTF_8));
				HttpResponse httpResponse = httpclient.execute(httppost);
				String response = EntityUtils
						.toString(httpResponse.getEntity());
				try {
					JSONObject myObject = new JSONObject(response);

					if (myObject.get("status").equals("success")) {
						checkSuccess = true;

						long dateInMilliSecs = System.currentTimeMillis();
						// update user table
						ContentValues cvForuser = new ContentValues();
						cvForuser.put("lastsyncdate", dateInMilliSecs);
						db.update("user", cvForuser, "user_id ='" + userId
								+ "'", null);

						backupSuccess = true;
					} else {
						Log.e("Sync status fail", "Sync status error");
					}
				} catch (JSONException e) {
					Log.e("exception in success", String.valueOf(e));
					backupSuccess = false;
				}

			} catch (ClientProtocolException e) {
				Log.e("protocol exception", String.valueOf(e));
				backupSuccess = false;
			} catch (IOException e) {
				Log.e("io exception", String.valueOf(e));
				backupSuccess = false;
			}
			if (backupSuccess) {

			}
		}
	}

	// split the file array list and upload files
	public void getFileAndUpload(ArrayList<String> arrayList, String directory,
			String destination) {
		for (int k = 0; k < arrayList.size(); k++) {
			String splitFiles = arrayList.get(k);
			String[] fileArray = splitFiles.split(",");
			for (int l = 0; l < fileArray.length; l++) {
				if (fileArray[l] != null && !fileArray[l].equals("")) {
					String fileLocation = Environment.getExternalStorageDirectory()
							+ directory + fileArray[l];
					postFile(fileLocation, destination);
				}
			}
		}
	}

	// check Internet connection
	boolean checkInternetConnection() {
		ConnectivityManager connectivityManager = (ConnectivityManager) this.context
				.getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo activeNetworkInfo = connectivityManager
				.getActiveNetworkInfo();
		return activeNetworkInfo != null && activeNetworkInfo.isConnected();
	}

	// post files to server
	public void postFile(String textFile, String filePath) {
		try {

			File files = new File(textFile);
			if (files.exists()) {

				HttpClient httpClient = new DefaultHttpClient();

				HttpPost httpPost = new HttpPost(fileSendUrl);
				File file = new File(textFile);

				FileBody fileBody = new FileBody(file);

				MultipartEntity reqEntity = new MultipartEntity();
				reqEntity.addPart("file", fileBody);
				reqEntity.addPart("filePath", new StringBody(filePath));
				httpPost.setEntity(reqEntity);

				HttpResponse response = httpClient.execute(httpPost);
				HttpEntity resEntity = response.getEntity();
				if (resEntity != null) {
					String responseStr = EntityUtils.toString(resEntity).trim();
				}
			} else {
				Log.e("", "File not found");
			}

		} catch (NullPointerException e) {
			Log.e("Null pointer Error: ", String.valueOf(e));
			e.printStackTrace();
		} catch (Exception e) {
			Log.e("Error Occured : ", String.valueOf(e));
			e.printStackTrace();
		}

	}

	// get file type
	public static String getMimeType(String url) {
		String type = "";
		String extension = MimeTypeMap.getFileExtensionFromUrl(url);
		if (extension != null) {
			MimeTypeMap mime = MimeTypeMap.getSingleton();
			type = mime.getMimeTypeFromExtension(extension);
		}
		return type;
	}

	// convert date format
	public String convertToNorwayFormat(String date) {
		String[] newdate = date.split("-");
		String formatDate = newdate[2] + "." + newdate[1] + "." + newdate[0];
		return formatDate;
	}

	// encode uri component
	public static String encodeURIComponent(String component) {
		String result = "";
		if (!component.equals("")) {

			try {
				result = URLEncoder.encode(component, "UTF-8")
						.replaceAll("\\%28", "(").replaceAll("\\%29", ")")
						.replaceAll("\\+", "%20").replaceAll("\\%27", "''")
						.replaceAll("\\%21", "!").replaceAll("\\%7E", "~");
			} catch (UnsupportedEncodingException e) {
				Log.e("encode exception", "encode exception");
				result = component;
			}
		}
		return result;
	}

	// create log file
	@SuppressLint("SimpleDateFormat")
	public void createLogFile(List<NameValuePair> nameValuePairs) {
		File logFile = new File("sdcard/".concat(FOLDER_NAME).concat(
				"/offlinepdf.log"));
		if (!logFile.exists()) {
			try {
				logFile.createNewFile();
			} catch (IOException e) {
				Log.e("File Creation Error", String.valueOf(e));
			}
		}
		try {
			BufferedWriter bufferWriter = new BufferedWriter(new FileWriter(
					logFile, true));
			SimpleDateFormat df = new SimpleDateFormat("EEE, d MMM yyyy, HH:mm");
			String date = df.format(Calendar.getInstance().getTime());
			String logText = "[" + date + " ] [notice] "
					+ nameValuePairs.toString() + " \n";
			bufferWriter.append(logText);
			bufferWriter.newLine();
			bufferWriter.close();
		} catch (IOException e) {
			Log.e("File IO Exception", String.valueOf(e.getMessage()));
		}
	}

	// convert milliseconds to date
	public static String getDate(long milliSeconds, String dateFormat) {
		SimpleDateFormat formatter = new SimpleDateFormat(dateFormat);

		Calendar calendar = Calendar.getInstance();
		calendar.setTimeInMillis(milliSeconds);
		return formatter.format(calendar.getTime());
	}
	// get the file size
	public String getFileSize(String destinationDir,String filename) {
		File sdcard = Environment.getExternalStorageDirectory();
		String destination = sdcard + "/"
				+ destinationDir;
		File backupDirectory = new File(destination,
				filename);
	    return String.valueOf(backupDirectory.length());
	}
}