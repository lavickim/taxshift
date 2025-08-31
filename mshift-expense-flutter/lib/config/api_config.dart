import 'dart:io';

class ApiConfig {
  // ngrok을 사용한 공개 URL (어디서든 접속 가능)
  static const String ngrokUrl = 'https://d6741ecc9577.ngrok-free.app';
  
  // Force manual mode for debugging (set to true to override automatic detection)
  static const bool forceManualMode = false;
  static const String manualUrl = 'https://d6741ecc9577.ngrok-free.app';
  
  static String get baseUrl {
    // Allow manual override for debugging
    if (forceManualMode) {
      print('🔧 Manual mode enabled - using: $manualUrl');
      return manualUrl;
    }
    
    if (Platform.isAndroid || Platform.isIOS) {
      try {
        // Android 에뮬레이터 감지 (improved detection)
        if (Platform.isAndroid) {
          final isEmulator = _isAndroidEmulator();
          
          if (isEmulator) {
            print('📱 Running on Android Emulator - using localhost proxy: 10.0.2.2:8090');
            return 'http://10.0.2.2:8090';
          } else {
            print('📱 Running on Physical Android Device - using ngrok: $ngrokUrl');
            return ngrokUrl;
          }
        }
        
        // iOS handling (both simulator and physical device use ngrok)
        if (Platform.isIOS) {
          final isSimulator = _isIOSSimulator();
          if (isSimulator) {
            print('📱 Running on iOS Simulator - using ngrok: $ngrokUrl');
          } else {
            print('📱 Running on Physical iOS Device - using ngrok: $ngrokUrl');
          }
          return ngrokUrl;
        }
      } catch (e) {
        print('⚠️  Error detecting device type: $e');
        print('📱 Falling back to ngrok URL');
        return ngrokUrl;
      }
    }
    
    // Desktop development fallback
    print('💻 Running on Desktop - using localhost: http://localhost:8090');
    return 'http://localhost:8090';
  }
  
  // Improved Android emulator detection
  static bool _isAndroidEmulator() {
    final version = Platform.version.toLowerCase();
    final environment = Platform.environment;
    
    // Multiple detection methods for better accuracy
    bool detectionMethods = 
        version.contains('sdk_gphone') ||
        version.contains('emulator') ||
        version.contains('sdk') ||
        version.contains('goldfish') ||
        version.contains('ranchu') ||
        environment['ANDROID_EMULATOR'] == 'true' ||
        environment['EMULATOR'] != null;
    
    return detectionMethods;
  }
  
  // iOS simulator detection
  static bool _isIOSSimulator() {
    // On iOS, we can check the environment
    final environment = Platform.environment;
    return environment['SIMULATOR_DEVICE_NAME'] != null ||
           environment['SIMULATOR_RUNTIME_VERSION'] != null;
  }
  
  // URL configuration constants for easy switching
  static const String emulatorUrl = 'http://10.0.2.2:8090';
  static const String deviceUrl = 'http://192.168.45.19:8090'; // Local network IP
  static const String localhostUrl = 'http://localhost:8090';
  
  // Utility method to get connection info for debugging
  static Map<String, dynamic> getConnectionInfo() {
    return {
      'current_url': baseUrl,
      'ngrok_url': ngrokUrl,
      'emulator_url': emulatorUrl,
      'device_url': deviceUrl,
      'localhost_url': localhostUrl,
      'manual_mode': forceManualMode,
      'manual_url': manualUrl,
      'platform': Platform.operatingSystem,
      'version': Platform.operatingSystemVersion,
      'is_android_emulator': Platform.isAndroid ? _isAndroidEmulator() : false,
      'is_ios_simulator': Platform.isIOS ? _isIOSSimulator() : false,
      'environment_vars': Platform.environment.keys
          .where((key) => key.toLowerCase().contains('emulator') || 
                         key.toLowerCase().contains('simulator'))
          .toList(),
    };
  }
}