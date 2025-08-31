import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/daily_memo.dart';

class DailyMemoService {
  static const String baseUrl = 'http://10.0.2.2:8090/api/daily-memos';

  Future<DailyMemo?> createOrUpdateMemo(DailyMemo memo) async {
    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(memo.toJson()),
      );

      if (response.statusCode == 200) {
        return DailyMemo.fromJson(jsonDecode(response.body));
      } else {
        print('Failed to save memo: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Error saving memo: $e');
      return null;
    }
  }

  Future<DailyMemo?> getMemoByDate(int userId, DateTime date) async {
    try {
      final dateStr = date.toIso8601String().split('T')[0];
      final response = await http.get(
        Uri.parse('$baseUrl/user/$userId/date/$dateStr'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return DailyMemo.fromJson(jsonDecode(response.body));
      } else if (response.statusCode == 204) {
        return null; // No memo for this date
      } else {
        print('Failed to get memo: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Error getting memo: $e');
      return null;
    }
  }

  Future<List<DailyMemo>> getMemosByMonth(int userId, int year, int month) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/$userId/month?year=$year&month=$month'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = jsonDecode(response.body);
        return jsonList.map((json) => DailyMemo.fromJson(json)).toList();
      } else {
        print('Failed to get memos: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('Error getting memos: $e');
      return [];
    }
  }

  Future<bool> deleteMemo(int userId, DateTime date) async {
    try {
      final dateStr = date.toIso8601String().split('T')[0];
      final response = await http.delete(
        Uri.parse('$baseUrl/user/$userId/date/$dateStr'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      return response.statusCode == 204;
    } catch (e) {
      print('Error deleting memo: $e');
      return false;
    }
  }
}