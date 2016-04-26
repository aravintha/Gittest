/**
 * it is android plugin class.
 * It is used to get the  
 * native android functionalities like application version name,code
 * 
 */
package com.processdrive.offlinepdf;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.channels.FileChannel;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.http.util.ByteArrayBuffer;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;

public class Utils extends CordovaPlugin {

	public final String ACTION_GET_LOCAL = "local";
	public final String ACTION_GET_LIVE = "live";
	public final String FILE_OPEN = "fileopen";
	public final String VERSION_CODE = "GetVersionCode";
	public final String VERSION_NAME = "GetVersionName";

	/**
	 * @param action
	 *            The action to execute.
	 * @param args
	 *            JSONArry of arguments for the plugin.
	 * @param callbackContext
	 *            The callback id used when calling back into JavaScript.
	 */
	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) {
		boolean result = false;

		/**
		 * get action from javascript and do the operation according to that.
		 */
		if (action.equals(VERSION_CODE)) {
			try {
				result = true;
				callbackContext.success(getApplicationVersionCode());
			} catch (Exception e) {
				callbackContext.error(e.getMessage());
			}
		} else if (action.equals(VERSION_NAME)) {
			try {
				result = true;
				callbackContext.success(getApplicationVersionName());
			} catch (Exception e) {
				callbackContext.error(e.getMessage());
			}
		} else if (action.equals(ACTION_GET_LOCAL)) {
			try {
				JSONObject arg_object = args.getJSONObject(0);
				// if (copyFileFromLocal(arg_object) > 0) {
				callbackContext.success(String
						.valueOf(copyFileFromLocal(arg_object)));
				// } else {
				// callbackContext.error("File Not Found");
				// }
				return true;
			} catch (Exception e) {
				callbackContext.error(e.getMessage());
				return false;
			}
		} else if (action.equals(ACTION_GET_LIVE)) {
			try {
				JSONObject arg_object = args.getJSONObject(0);
				if (downloadFileFromServer(arg_object)) {
					callbackContext.success();
				} else {
					callbackContext.error("File Not Downloaded");
				}
				return true;
			} catch (Exception e) {
				Log.d("DownloadManager", "Error:" + e);
				callbackContext.error(e.getMessage());
				return false;
			}
		} else if (action.equals(FILE_OPEN)) {

			try {
				JSONObject arg_object = args.getJSONObject(0);
				return openFile(arg_object.getString("filename"),
						arg_object.getString("type"));
			} catch (Exception e) {
				return false;
			}
		} else if (action.equals("FILE_SIZE")) {
			try {
				JSONObject arg_object = args.getJSONObject(0);
				callbackContext.success(getFileSize(
						arg_object.getString("destination"),
						arg_object.getString("filename")));
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		} else {
			JSONObject errorObj = new JSONObject();
			try {
				errorObj.put("status",
						PluginResult.Status.INVALID_ACTION.ordinal());
				errorObj.put("message", "Invalid action");
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			callbackContext.error(errorObj);
			return false;
		}
		return result;
	}
	//get file size
	public String getFileSize(String destinationDir, String filename) {
		File sdcard = Environment.getExternalStorageDirectory();
		
		String destination = sdcard + "/" + destinationDir;
		File backupDirectory = new File(destination, filename);
		Log.e("file size", String.valueOf(backupDirectory.length()));
		return String.valueOf(backupDirectory.length());
	}

	// copy file from one directory to another directory in local
	@SuppressWarnings("resource")
	private long copyFileFromLocal(JSONObject arg_object) {
		long result = 0;
		try {
			File sdcard = Environment.getExternalStorageDirectory();
			String currentDirPath = arg_object.getString("source");
			if (sdcard.canWrite()) {
				String destinationDir = sdcard + "/"
						+ arg_object.getString("destination");
				File dir = new File(sdcard + "/"
						+ arg_object.getString("destination"));
				if (dir.exists() == false) {
					dir.mkdirs();
				}
				Log.e("destination", destinationDir);
				Log.e("source", currentDirPath);

				File currentDirectory = new File(sdcard, currentDirPath);
				File backupDirectory = new File(destinationDir,
						arg_object.getString("newfilename"));

				if (currentDirectory.exists()) {

					FileChannel src = new FileInputStream(currentDirectory)
							.getChannel();
					FileChannel fileChanel = new FileOutputStream(
							backupDirectory).getChannel();
					fileChanel.transferFrom(src, 0, src.size());
					src.close();
					fileChanel.close();
					Log.e("file size", String.valueOf(backupDirectory.length()));
					result = backupDirectory.length();
				}
			}
		} catch (Exception e) {
			Log.e("File Download Error in Local",
					String.valueOf(e.getMessage()));
		}
		return result;
	}

	// download file from server to local
	private boolean downloadFileFromServer(JSONObject arg_object) {
		try {
			File sd = Environment.getExternalStorageDirectory();
			File dir = new File(sd + "/" + arg_object.getString("destination"));
			if (dir.exists() == false || !dir.exists()) {
				Log.e("not exist", "not exist");
				dir.mkdirs();
			}

			URL url = new URL(arg_object.getString("source"));
			File file = new File(dir, arg_object.getString("newfilename"));
			URLConnection uconn = url.openConnection();

			InputStream is = uconn.getInputStream();
			BufferedInputStream bufferinstream = new BufferedInputStream(is);

			ByteArrayBuffer baf = new ByteArrayBuffer(5000);
			int current = 0;
			while ((current = bufferinstream.read()) != -1) {
				baf.append((byte) current);
			}

			FileOutputStream fos = new FileOutputStream(file);
			fos.write(baf.toByteArray());
			fos.flush();
			fos.close();
			return true;
		} catch (Exception e) {
			Log.e("File Downloading Error in Live",
					String.valueOf(e.getMessage()));
			return false;
		}
	}

	// open pdf file to view
	private boolean openFile(String fileName, String contentType)
			throws JSONException {
		File file = new File(fileName);

		if (file.exists()) {
			try {
				Uri path = Uri.fromFile(file);
				Intent intent = new Intent(Intent.ACTION_VIEW);
				intent.setDataAndType(path, contentType);
				intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
				cordova.getActivity().startActivity(intent);
				return true;
			} catch (android.content.ActivityNotFoundException e) {
				return false;
			}
		} else {
			return false;
		}
	}

	// find application version code
	private int getApplicationVersionCode() {
		int versionCode = 0;
		try {
			PackageInfo packageInfo = callPackageManager().getPackageInfo(
					this.cordova.getActivity().getPackageName(), 0);
			versionCode = packageInfo.versionCode;
		} catch (Exception e) {
			Log.e("Package version Exception", String.valueOf(e.getMessage()));
		}
		return versionCode;
	}

	// find application version name
	private String getApplicationVersionName() {
		String versionName = "";
		try {
			PackageInfo packageInfo = callPackageManager().getPackageInfo(
					this.cordova.getActivity().getPackageName(), 0);
			versionName = packageInfo.versionName;
		} catch (Exception e) {
			Log.e("Packagename exception", String.valueOf(e.getMessage()));
		}
		return versionName;
	}

	// package manager
	private PackageManager callPackageManager() {
		PackageManager packageManager = this.cordova.getActivity()
				.getPackageManager();
		return packageManager;
	}
}