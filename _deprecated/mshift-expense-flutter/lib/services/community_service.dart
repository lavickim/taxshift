import 'dart:convert';
import '../config/api_config.dart';
import '../utils/http_client.dart';

class CommunityService {
  static String get baseUrl => '${ApiConfig.baseUrl}/api/v1/community';
  
  // 게시물 목록 조회
  static Future<Map<String, dynamic>> getPosts({
    String? category,
    String sort = 'latest',
    int page = 0,
    int size = 10,
  }) async {
    try {
      String url = '$baseUrl/posts?sort=$sort&page=$page&size=$size';
      if (category != null && category != '추천' && category != '최신') {
        url += '&category=$category';
      }
      
      final response = await HttpClient.get(url);
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load posts');
      }
    } catch (e) {
      print('Error loading posts: $e');
      throw e;
    }
  }
  
  // 게시물 상세 조회
  static Future<Map<String, dynamic>> getPost(int postId) async {
    try {
      final response = await HttpClient.get('$baseUrl/posts/$postId');
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load post');
      }
    } catch (e) {
      print('Error loading post: $e');
      throw e;
    }
  }
  
  // 게시물 작성
  static Future<Map<String, dynamic>> createPost({
    required String title,
    required String content,
    required String category,
    bool hasImage = false,
    String? imageUrl,
    int userId = 1,
  }) async {
    try {
      final response = await HttpClient.post(
        '$baseUrl/posts?userId=$userId',
        body: {
          'title': title,
          'content': content,
          'category': category,
          'hasImage': hasImage,
          'imageUrl': imageUrl,
        },
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to create post');
      }
    } catch (e) {
      print('Error creating post: $e');
      throw e;
    }
  }
  
  // 게시물 좋아요
  static Future<void> likePost(int postId, {int userId = 1}) async {
    try {
      final response = await HttpClient.post(
        '$baseUrl/posts/$postId/like?userId=$userId',
      );
      
      if (response.statusCode != 200) {
        throw Exception('Failed to like post');
      }
    } catch (e) {
      print('Error liking post: $e');
      throw e;
    }
  }
  
  // 댓글 작성
  static Future<Map<String, dynamic>> createComment({
    required int postId,
    required String content,
    int userId = 1,
  }) async {
    try {
      final response = await HttpClient.post(
        '$baseUrl/posts/$postId/comments?userId=$userId',
        body: {
          'content': content,
        },
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to create comment');
      }
    } catch (e) {
      print('Error creating comment: $e');
      throw e;
    }
  }
  
  // 댓글 삭제
  static Future<void> deleteComment(int commentId) async {
    try {
      final response = await HttpClient.delete(
        '$baseUrl/comments/$commentId',
      );
      
      if (response.statusCode != 200) {
        throw Exception('Failed to delete comment');
      }
    } catch (e) {
      print('Error deleting comment: $e');
      throw e;
    }
  }
}