import 'package:http/http.dart' as http;
import 'dart:convert';

class ChallengeService {
  static const String baseUrl = 'http://10.0.2.2:8090/api/v1/challenges';
  
  // 챌린지 목록 조회
  static Future<Map<String, dynamic>> getChallenges({
    String? category,
    String? type,
    String sort = 'recent',
    int page = 0,
    int size = 10,
  }) async {
    try {
      String url = '$baseUrl?sort=$sort&page=$page&size=$size';
      if (category != null) {
        url += '&category=$category';
      }
      if (type != null) {
        url += '&type=$type';
      }
      
      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load challenges');
      }
    } catch (e) {
      print('Error loading challenges: $e');
      throw e;
    }
  }
  
  // 챌린지 상세 조회
  static Future<Map<String, dynamic>> getChallenge(int challengeId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/$challengeId'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load challenge');
      }
    } catch (e) {
      print('Error loading challenge: $e');
      throw e;
    }
  }
  
  // 챌린지 참여
  static Future<Map<String, dynamic>> joinChallenge(int challengeId, int userId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/$challengeId/join?userId=$userId'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to join challenge');
      }
    } catch (e) {
      print('Error joining challenge: $e');
      throw e;
    }
  }
  
  // 사용자의 챌린지 목록
  static Future<Map<String, dynamic>> getUserChallenges(
    int userId, {
    String? status,
    int page = 0,
    int size = 10,
  }) async {
    try {
      String url = '$baseUrl/user/$userId?page=$page&size=$size';
      if (status != null) {
        url += '&status=$status';
      }
      
      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load user challenges');
      }
    } catch (e) {
      print('Error loading user challenges: $e');
      throw e;
    }
  }
  
  // 사용자 레벨 정보
  static Future<Map<String, dynamic>> getUserLevel(int userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/$userId/level'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load user level');
      }
    } catch (e) {
      print('Error loading user level: $e');
      throw e;
    }
  }
  
  // 챌린지 진행 상황 업데이트
  static Future<Map<String, dynamic>> updateProgress(
    int userChallengeId, {
    double? amount,
    int? count,
  }) async {
    try {
      String url = '$baseUrl/user-challenges/$userChallengeId/progress?';
      if (amount != null) {
        url += 'amount=$amount&';
      }
      if (count != null) {
        url += 'count=$count';
      }
      
      final response = await http.put(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to update progress');
      }
    } catch (e) {
      print('Error updating progress: $e');
      throw e;
    }
  }
  
  // 사용자 통계
  static Future<Map<String, dynamic>> getUserStats(int userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/$userId/stats'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load user stats');
      }
    } catch (e) {
      print('Error loading user stats: $e');
      throw e;
    }
  }
}