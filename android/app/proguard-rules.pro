# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# WebSocket
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Preserve WebSocket classes
-keep class org.java_websocket.** { *; }
-keep interface org.java_websocket.** { *; }

# Keep Android networking
-keep class android.net.** { *; }

# Keep JSON parsing
-keepattributes Signature
-keepattributes *Annotation*
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.** { *; }

# Debugging (remove in production)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
