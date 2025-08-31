import 'dart:async';
import 'dart:io';
import '../config/api_config.dart';
import 'http_client.dart';

class ConnectionTest {
  static Future<Map<String, dynamic>> runFullDiagnostic() async {
    Map<String, dynamic> results = {
      'timestamp': DateTime.now().toIso8601String(),
      'device_info': await _getDeviceInfo(),
      'network_tests': {},
      'api_tests': {},
      'recommendations': [],
    };

    print('🔍 Starting connection diagnostic...');

    // Test basic connectivity
    results['network_tests'] = await _runNetworkTests();
    
    // Test API endpoints
    results['api_tests'] = await _runApiTests();
    
    // Generate recommendations
    results['recommendations'] = _generateRecommendations(results);

    print('✅ Diagnostic completed');
    return results;
  }

  static Future<Map<String, dynamic>> _getDeviceInfo() async {
    // Use the new comprehensive connection info from ApiConfig
    return ApiConfig.getConnectionInfo();
  }

  static bool _isEmulator() {
    // Use ApiConfig's improved detection methods
    if (Platform.isAndroid) {
      return ApiConfig.getConnectionInfo()['is_android_emulator'] as bool;
    }
    return false;
  }

  static Future<Map<String, dynamic>> _runNetworkTests() async {
    Map<String, dynamic> tests = {};

    // Test internet connectivity
    print('📡 Testing internet connectivity...');
    tests['internet'] = await _testInternetConnectivity();

    // Test ngrok URL accessibility
    if (ApiConfig.baseUrl.contains('ngrok')) {
      print('🌐 Testing ngrok accessibility...');
      tests['ngrok'] = await _testNgrokAccessibility();
    }

    // Test local server accessibility (for emulators)
    if (Platform.isAndroid && _isEmulator()) {
      print('🖥️  Testing local server accessibility...');
      tests['local_server'] = await _testLocalServerAccessibility();
    }

    return tests;
  }

  static Future<Map<String, dynamic>> _runApiTests() async {
    Map<String, dynamic> tests = {};

    // Test health endpoint (if exists)
    print('❤️  Testing API health endpoint...');
    tests['health'] = await _testHealthEndpoint();

    // Test actual API endpoint
    print('🔌 Testing daily memo endpoint...');
    tests['daily_memo'] = await _testDailyMemoEndpoint();

    return tests;
  }

  static Future<Map<String, String>> _testInternetConnectivity() async {
    try {
      final result = await InternetAddress.lookup('google.com')
          .timeout(Duration(seconds: 10));
      
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return {'status': 'success', 'message': 'Internet connectivity OK'};
      } else {
        return {'status': 'failure', 'message': 'No internet connection'};
      }
    } catch (e) {
      return {'status': 'failure', 'message': 'Internet test failed: $e'};
    }
  }

  static Future<Map<String, String>> _testNgrokAccessibility() async {
    try {
      final response = await HttpClient.get(ApiConfig.ngrokUrl)
          .timeout(Duration(seconds: 15));
      
      return {
        'status': 'success',
        'message': 'ngrok accessible, status: ${response.statusCode}',
        'status_code': response.statusCode.toString(),
      };
    } catch (e) {
      return {'status': 'failure', 'message': 'ngrok test failed: $e'};
    }
  }

  static Future<Map<String, String>> _testLocalServerAccessibility() async {
    try {
      final response = await HttpClient.get('http://10.0.2.2:8090')
          .timeout(Duration(seconds: 10));
      
      return {
        'status': 'success',
        'message': 'Local server accessible, status: ${response.statusCode}',
        'status_code': response.statusCode.toString(),
      };
    } catch (e) {
      return {'status': 'failure', 'message': 'Local server test failed: $e'};
    }
  }

  static Future<Map<String, String>> _testHealthEndpoint() async {
    try {
      final url = '${ApiConfig.baseUrl}/actuator/health';
      final response = await HttpClient.get(url)
          .timeout(Duration(seconds: 20));
      
      return {
        'status': response.statusCode == 200 ? 'success' : 'partial',
        'message': 'Health endpoint responded with ${response.statusCode}',
        'status_code': response.statusCode.toString(),
      };
    } catch (e) {
      return {'status': 'failure', 'message': 'Health endpoint test failed: $e'};
    }
  }

  static Future<Map<String, String>> _testDailyMemoEndpoint() async {
    try {
      final url = '${ApiConfig.baseUrl}/api/daily-memos/user/1/date/2025-08-31';
      final response = await HttpClient.get(url)
          .timeout(Duration(seconds: 20));
      
      return {
        'status': response.statusCode < 500 ? 'success' : 'failure',
        'message': 'API endpoint responded with ${response.statusCode}',
        'status_code': response.statusCode.toString(),
      };
    } catch (e) {
      return {'status': 'failure', 'message': 'API endpoint test failed: $e'};
    }
  }

  static List<String> _generateRecommendations(Map<String, dynamic> results) {
    List<String> recommendations = [];

    final networkTests = results['network_tests'] as Map<String, dynamic>;
    final apiTests = results['api_tests'] as Map<String, dynamic>;

    // Internet connectivity recommendations
    if (networkTests['internet']?['status'] != 'success') {
      recommendations.add('❌ Check your internet connection');
    }

    // ngrok specific recommendations
    if (ApiConfig.baseUrl.contains('ngrok')) {
      if (networkTests['ngrok']?['status'] != 'success') {
        recommendations.addAll([
          '🔄 Restart your ngrok tunnel',
          '🌐 Verify ngrok URL is still active',
          '⚙️  Check ngrok authentication token',
        ]);
      }
      
      if (apiTests['health']?['status'] != 'success' && 
          apiTests['daily_memo']?['status'] != 'success') {
        recommendations.addAll([
          '🔧 Restart your backend server',
          '📋 Check backend server logs for errors',
        ]);
      }
    }

    // General API recommendations
    if (apiTests['daily_memo']?['status'] == 'failure') {
      recommendations.addAll([
        '🔍 Check backend server is running on correct port',
        '📊 Verify database connections are working',
      ]);
    }

    if (recommendations.isEmpty) {
      recommendations.add('✅ All systems appear to be working correctly');
    }

    return recommendations;
  }

  // Quick test method for simple connectivity check
  static Future<bool> quickConnectivityTest() async {
    try {
      final response = await HttpClient.get(ApiConfig.baseUrl)
          .timeout(Duration(seconds: 10));
      return response.statusCode < 500;
    } catch (e) {
      print('Quick connectivity test failed: $e');
      return false;
    }
  }
}