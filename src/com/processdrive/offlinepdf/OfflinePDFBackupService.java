package com.processdrive.offlinepdf;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONException;
import org.json.JSONObject;

import android.R;
import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Handler;
import android.os.PowerManager;
import android.util.Log;

import com.red_folder.phonegap.plugin.backgroundservice.BackgroundService;

@SuppressWarnings("deprecation")
@SuppressLint({ "CommitPrefEdits", "SdCardPath", "SimpleDateFormat", "Wakelock" })
public class OfflinePDFBackupService extends BackgroundService {

	private String mHelloTo;
	SharedPreferences sharedpreferences;
	final Handler handler = new Handler();
	Runnable runnable, closeNotification;
	DatabaseHandler mDbHelper;
	Boolean checkDBhandlerRun = false;
	@SuppressWarnings("unused")
	private NotificationManager mNotificationManager;
	NotificationManager startMgr;
	Boolean checkStartNotify;
	SharedPreferences mPreferences;
	SharedPreferences settingss;
	boolean isServerAvailable = false;
	final String APP_NAME = "offlinepdf";
	
	String START_MESSAGE = APP_NAME.concat(" backup started!");
	String START_MESSAGE_TITLE = "Backup in progress!";
	
	String SUCCESS_MESSAGE = APP_NAME.concat(" backed up successfully!");
	String SUCCESS_MESSGAE_TITLE = "Backed up successfully!";
	
	String FAILURE_MESSAGE = APP_NAME.concat(" backup failed");
	String FAILURE_MESSAGE_TITLE = "Backup fail";
	
	String SERVER_FAILURE_MESSAGE = APP_NAME.concat(" server not found");
	String SERVER_FAILURE_TITLE =  "Server error";
	
	String NO_ORDERS_MESSAGE = APP_NAME.concat(" no orders updated");
	String NO_ORDERS_MESSAGE_TITLE = "No orders to backup";
		
	private PowerManager.WakeLock wl = null;
	@Override
	public void onCreate() {}

	@Override
	protected JSONObject doWork() {
		
		JSONObject result = new JSONObject();
		try {
			String msg = "Hello ";
			result.put("Message", msg);

			final String PREFS_NAME = "MyPrefsFile";

			SharedPreferences settings = getSharedPreferences(PREFS_NAME, 0);
			if (settings.getBoolean("offline_first_time", true)) {
				settings.edit().putBoolean("offline_first_time", false)
						.commit();
			} else {
				
				if (checkInternetConnection()) {
					//userNotify(START_MESSAGE,START_MESSAGE_TITLE,R.drawable.ic_dialog_info,1);
					
					if(getServerResponse(DatabaseHandler.dataSendUrl)){
					mDbHelper = new DatabaseHandler(getApplicationContext(),
							"", null, 0, null);
					if (mDbHelper.checkDatabaseSuccess) {
						if(mDbHelper.getModifiedOrderCount() > 0){
							userNotify(START_MESSAGE,START_MESSAGE_TITLE,R.drawable.ic_dialog_info,1);
							if(mDbHelper.backupOrders() && mDbHelper.backupSuccess){
								userNotify(SUCCESS_MESSAGE,SUCCESS_MESSGAE_TITLE,R.drawable.stat_notify_sync,2);
							}else if(!mDbHelper.backupSuccess){
								userNotify(FAILURE_MESSAGE, FAILURE_MESSAGE_TITLE, R.drawable.ic_delete, 3);
							}
						} else {
							userNotify(NO_ORDERS_MESSAGE, NO_ORDERS_MESSAGE_TITLE, R.drawable.ic_dialog_info, 5);
						}
					}
					}else{
						// for server failure notification
						userNotify(SERVER_FAILURE_MESSAGE, SERVER_FAILURE_TITLE, R.drawable.ic_delete, 4);
					}
				}
			}
		} catch (JSONException e) {
		}
		return result;
	}

	@Override
	protected JSONObject getConfig() {
		JSONObject result = new JSONObject();
		try {
			result.put("HelloTo", this.mHelloTo);
		} catch (JSONException e) {
		}
		return result;
	}

	@Override
	protected void setConfig(JSONObject config) {
		try {
			if (config.has("HelloTo"))
				this.mHelloTo = config.getString("HelloTo");

		} catch (JSONException e) {
		}

	}

	@Override
	protected JSONObject initialiseLatestResult() {
		return null;
	}

	@Override
	protected void onTimerEnabled() {
		
		if (wl == null) {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            this.wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "doWork()");
            wl.setReferenceCounted(false);
            if (!wl.isHeld()) {
                wl.acquire();
                Log.i("WakeLock", "Acquired wake lock!");
            }
        } else {
            if (!wl.isHeld()) {
                wl.acquire();
            }
        }
	}

	@Override
	protected void onTimerDisabled() {
	}

	//check Internet connection
	boolean checkInternetConnection() {
		ConnectivityManager connectivityManager = (ConnectivityManager) this
				.getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo activeNetworkInfo = connectivityManager
				.getActiveNetworkInfo();
		return activeNetworkInfo != null && activeNetworkInfo.isConnected();
	}
	
	// to show the notification
	public void userNotify(String message, String messageTitle, int icon, int notificationId){
		
		final NotificationManager mgr = (NotificationManager) this
				.getSystemService(Context.NOTIFICATION_SERVICE);
		Notification note = new Notification(icon,
				message,
				System.currentTimeMillis());

		PendingIntent pendingIntent = PendingIntent.getActivity(this, notificationId,
				new Intent(this, NotificationView.class), notificationId);

		note.setLatestEventInfo(this, APP_NAME,
				messageTitle, pendingIntent);
		mgr.notify(notificationId, note);
	}
	// for notification view
	public class NotificationView{
		
	}
	// get server status
	public boolean getServerResponse(String url){
		try{
		HttpPost httppost = new HttpPost(url);
		HttpClient httpclient = new DefaultHttpClient();
		httpclient.execute(httppost);
		return true;
		}catch(Exception e){
			Log.e("exception", String.valueOf(e));
			return false;
		}
	}
}
