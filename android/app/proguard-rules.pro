# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated / worklets
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Boot-critical runtime classes (release minify stability on device)
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.fbjni.** { *; }
-keep class com.facebook.soloader.** { *; }
-keep class expo.modules.** { *; }
-keep class com.anonymous.HabitFlow.** { *; }
-keepattributes *Annotation*, InnerClasses, Signature

# Add any project specific keep options here:
