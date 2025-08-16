package com.yaranahapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.content.Intent;

public class BackgroundServiceModule extends ReactContextBaseJavaModule {
    BackgroundServiceModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "BackgroundService";
    }

    @ReactMethod
    public void startService() {
        Intent serviceIntent = new Intent(getReactApplicationContext(), DataSendingService.class);
        getReactApplicationContext().startForegroundService(serviceIntent);
    }

    @ReactMethod
    public void sendUserData(String userData) {
        Intent intent = new Intent(getReactApplicationContext(), DataSendingService.class);
        intent.putExtra("user_data", userData);
        getReactApplicationContext().startForegroundService(intent);
    }
}