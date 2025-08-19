package com.yaranahapp;

import android.accessibilityservice.AccessibilityService;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;

public class MyAccessibilityService extends AccessibilityService {
    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        if (event.getEventType() == AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED) {
            String text = (event.getText() != null) ? event.getText().toString() : "";
            String packageName = (event.getPackageName() != null) ? event.getPackageName().toString() : "";
            Log.d("Accessibility", "Notification: " + packageName + " - " + text);
        }
    }

    @Override
    public void onInterrupt() {
        Log.d("Accessibility", "Service interrupted");
    }
}