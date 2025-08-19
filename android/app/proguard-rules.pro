# برای React Native و Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# برای react-native-background-fetch
-keep class com.transistorsoft.rnbackgroundfetch.** { *; }
-dontwarn com.transistorsoft.rnbackgroundfetch.**

# برای OkHttp
-keep class com.squareup.okhttp3.** { *; }
-dontwarn com.squareup.okhttp3.**

# برای Retrofit
-keep class com.squareup.retrofit2.** { *; }
-dontwarn com.squareup.retrofit2.**

# برای Socket.IO
-keep class io.socket.** { *; }
-dontwarn io.socket.**

# برای جلوگیری از حذف کلاس‌های Java که ممکنه در کد custom باشن
-keep class com.yaranahapp.** { *; }
-dontwarn com.yaranahapp.**