@echo off
echo ===============================
echo 🔥 React Native Build Fixer 🔥
echo ===============================

REM 1) پاکسازی npm cache و نصب مجدد
echo 📦 Cleaning node_modules...
rmdir /s /q node_modules
del /f /q package-lock.json
call npm install

REM 2) نصب ماژول‌های مهم که معمولا خطا میدن
echo 📥 Installing required dependencies...
call npm install @react-native-async-storage/async-storage
call npm install react-native-permissions
call npm install @react-native-community/background-fetch

REM 3) پاکسازی کش Metro
echo 🧹 Clearing Metro bundler cache...
call npx react-native start --reset-cache

REM 4) پاکسازی Gradle build
cd android
echo 🧹 Running gradlew clean...
call gradlew clean
cd ..

REM 5) تست باندل دستی قبل از ساخت Release
echo ⚙️ Bundling JavaScript manually...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/build/generated/assets/react/release/index.android.bundle --assets-dest android/app/build/generated/res/react/release

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Bundle failed! Check your JS imports or missing modules.
    exit /b %ERRORLEVEL%
)

REM 6) ساخت APK Release
cd android
echo 📲 Building release APK...
call gradlew assembleRelease --stacktrace

IF %ERRORLEVEL% EQU 0 (
    echo ✅ Build completed successfully!
    echo APK is located at: android\app\build\outputs\apk\release\app-release.apk
) ELSE (
    echo ❌ Build failed. Please check the error log above.
)

cd ..
pause
