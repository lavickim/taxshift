package com.moneyshift.expense.controller;

import com.moneyshift.expense.dto.PostDto;
import com.moneyshift.expense.dto.CommentDto;
import com.moneyshift.expense.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/community")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommunityController {
    
    private final CommunityService communityService;
    
    // 게시물 목록 조회
    @GetMapping("/posts")
    public ResponseEntity<Page<PostDto>> getPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<PostDto> posts = communityService.getPosts(category, sort, page, size);
        return ResponseEntity.ok(posts);
    }
    
    // 게시물 상세 조회
    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long postId) {
        PostDto post = communityService.getPost(postId);
        return ResponseEntity.ok(post);
    }
    
    // 게시물 작성
    @PostMapping("/posts")
    public ResponseEntity<PostDto> createPost(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestBody PostDto postDto) {
        
        PostDto created = communityService.createPost(userId, postDto);
        return ResponseEntity.ok(created);
    }
    
    // 게시물 수정
    @PutMapping("/posts/{postId}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long postId,
            @RequestBody PostDto postDto) {
        
        PostDto updated = communityService.updatePost(postId, postDto);
        return ResponseEntity.ok(updated);
    }
    
    // 게시물 삭제
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable Long postId) {
        communityService.deletePost(postId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "게시물이 삭제되었습니다.");
        return ResponseEntity.ok(response);
    }
    
    // 게시물 좋아요
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<Map<String, String>> likePost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "1") Long userId) {
        
        communityService.likePost(postId, userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "좋아요가 추가되었습니다.");
        return ResponseEntity.ok(response);
    }
    
    // 댓글 목록 조회
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<PostDto> getComments(@PathVariable Long postId) {
        PostDto post = communityService.getPost(postId);
        return ResponseEntity.ok(post);
    }
    
    // 댓글 작성
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDto> createComment(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "1") Long userId,
            @RequestBody CommentDto commentDto) {
        
        CommentDto created = communityService.createComment(postId, userId, commentDto);
        return ResponseEntity.ok(created);
    }
    
    // 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(@PathVariable Long commentId) {
        communityService.deleteComment(commentId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "댓글이 삭제되었습니다.");
        return ResponseEntity.ok(response);
    }
}