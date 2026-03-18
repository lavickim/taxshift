import 'package:http/http.dart' as http;
import 'dart:convert';

class HttpClient {
  // Robust HTTP client configuration optimized for ngrok connections
  static final http.Client _client = http.Client();
  
  // Timeout configurations - increased for ngrok stability
  static const Duration _receiveTimeout = Duration(seconds: 60);
  static const int _maxRetries = 3;
  static const Duration _retryDelay = Duration(milliseconds: 1000);
  
  // Enhanced headers for ngrok and general HTTP stability
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'User-Agent': 'MoneyShift-Flutter/1.0',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  };

  // Enhanced GET request with retry logic
  static Future<http.Response> get(String url) async {
    return await _makeRequest(() => _client.get(
      Uri.parse(url),
      headers: headers,
    ).timeout(_receiveTimeout));
  }

  // Enhanced POST request with retry logic
  static Future<http.Response> post(String url, {Map<String, dynamic>? body}) async {
    return await _makeRequest(() => _client.post(
      Uri.parse(url),
      headers: headers,
      body: body != null ? json.encode(body) : null,
    ).timeout(_receiveTimeout));
  }

  // Enhanced PUT request with retry logic
  static Future<http.Response> put(String url, {Map<String, dynamic>? body}) async {
    return await _makeRequest(() => _client.put(
      Uri.parse(url),
      headers: headers,
      body: body != null ? json.encode(body) : null,
    ).timeout(_receiveTimeout));
  }

  // Enhanced DELETE request with retry logic
  static Future<http.Response> delete(String url) async {
    return await _makeRequest(() => _client.delete(
      Uri.parse(url),
      headers: headers,
    ).timeout(_receiveTimeout));
  }

  // Retry logic for handling transient network failures
  static Future<http.Response> _makeRequest(Future<http.Response> Function() request) async {
    int attempts = 0;
    
    while (attempts < _maxRetries) {
      try {
        final response = await request();
        
        // Log successful connection for debugging
        print('HTTP request successful (attempt ${attempts + 1}): ${response.statusCode}');
        
        return response;
      } catch (e) {
        attempts++;
        
        if (attempts >= _maxRetries) {
          print('HTTP request failed after $attempts attempts: $e');
          
          // Provide more specific error information for debugging
          if (e.toString().contains('Connection closed before full header was received')) {
            print('ngrok connection issue - try restarting ngrok tunnel');
          } else if (e.toString().contains('SocketException')) {
            print('Network connection issue - check internet connectivity');
          }
          
          rethrow;
        }
        
        print('HTTP request attempt $attempts failed: $e. Retrying in ${_retryDelay.inMilliseconds}ms...');
        await Future.delayed(_retryDelay);
      }
    }
    
    throw Exception('Unexpected error in HTTP request retry logic');
  }

  // Method to test connection health
  static Future<bool> testConnection(String baseUrl) async {
    try {
      final response = await get('$baseUrl/health').timeout(Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (e) {
      print('Connection test failed: $e');
      return false;
    }
  }

  // Cleanup method
  static void dispose() {
    _client.close();
  }
}