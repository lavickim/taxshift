package com.moneyshift.expense.service;

import com.moneyshift.expense.dto.PostDto;
import com.moneyshift.expense.dto.CommentDto;
import com.moneyshift.expense.entity.*;
import com.moneyshift.expense.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityService {
    
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final CommunityUserRepository communityUserRepository;
    private final UserRepository userRepository;
    
    // 게시물 목록 조회
    public Page<PostDto> getPosts(String category, String sort, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts;
        
        if ("추천".equals(category) || "popular".equals(sort)) {
            posts = postRepository.findPopularPosts(pageable);
        } else if ("최신".equals(category) || category == null) {
            posts = postRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageable);
        } else {
            posts = postRepository.findByCategoryAndIsDeletedFalseOrderByCreatedAtDesc(category, pageable);
        }
        
        return posts.map(this::convertToDto);
    }
    
    // 게시물 상세 조회
    public PostDto getPost(Long postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시물을 찾을 수 없습니다."));
        
        // 조회수 증가
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
        
        PostDto dto = convertToDto(post);
        
        // 댓글 추가
        List<Comment> comments = commentRepository.findByPostAndIsDeletedFalseOrderByCreatedAtDesc(post);
        dto.setComments(comments.stream().map(this::convertCommentToDto).collect(Collectors.toList()));
        
        return dto;
    }
    
    // 게시물 작성
    public PostDto createPost(Long userId, PostDto postDto) {
        // 커뮤니티 사용자 찾기 또는 생성
        CommunityUser communityUser = communityUserRepository.findByUserUserId(userId)
            .orElseGet(() -> createCommunityUser(userId));
        
        Post post = new Post();
        post.setAuthor(communityUser);
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setCategory(postDto.getCategory());
        post.setHasImage(postDto.getHasImage() != null ? postDto.getHasImage() : false);
        post.setImageUrl(postDto.getImageUrl());
        
        Post saved = postRepository.save(post);
        return convertToDto(saved);
    }
    
    // 게시물 수정
    public PostDto updatePost(Long postId, PostDto postDto) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시물을 찾을 수 없습니다."));
        
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setCategory(postDto.getCategory());
        
        Post saved = postRepository.save(post);
        return convertToDto(saved);
    }
    
    // 게시물 삭제
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시물을 찾을 수 없습니다."));
        
        post.setIsDeleted(true);
        postRepository.save(post);
    }
    
    // 게시물 좋아요
    public void likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시물을 찾을 수 없습니다."));
        
        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);
    }
    
    // 댓글 작성
    public CommentDto createComment(Long postId, Long userId, CommentDto commentDto) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시물을 찾을 수 없습니다."));
        
        CommunityUser communityUser = communityUserRepository.findByUserUserId(userId)
            .orElseGet(() -> createCommunityUser(userId));
        
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(communityUser);
        comment.setContent(commentDto.getContent());
        
        Comment saved = commentRepository.save(comment);
        
        // 댓글 수 증가
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);
        
        return convertCommentToDto(saved);
    }
    
    // 댓글 삭제
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
        
        comment.setIsDeleted(true);
        commentRepository.save(comment);
        
        // 댓글 수 감소
        Post post = comment.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
    }
    
    // 커뮤니티 사용자 생성
    private CommunityUser createCommunityUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        CommunityUser communityUser = new CommunityUser();
        communityUser.setUser(user);
        communityUser.setNickname("사용자" + userId);
        communityUser.setBio("안녕하세요!");
        
        return communityUserRepository.save(communityUser);
    }
    
    // Post Entity를 DTO로 변환
    private PostDto convertToDto(Post post) {
        PostDto dto = new PostDto();
        dto.setId(post.getId());
        dto.setAuthor(post.getAuthor().getNickname());
        dto.setAuthorId(post.getAuthor().getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setCategory(post.getCategory());
        dto.setViewCount(post.getViewCount());
        dto.setLikeCount(post.getLikeCount());
        dto.setCommentCount(post.getCommentCount());
        dto.setHasImage(post.getHasImage());
        dto.setImageUrl(post.getImageUrl());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setTimeAgo(getTimeAgo(post.getCreatedAt()));
        dto.setIsLiked(false); // TODO: 실제 좋아요 여부 확인
        return dto;
    }
    
    // Comment Entity를 DTO로 변환
    private CommentDto convertCommentToDto(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        dto.setAuthor(comment.getAuthor().getNickname());
        dto.setAuthorId(comment.getAuthor().getId());
        dto.setContent(comment.getContent());
        dto.setLikeCount(comment.getLikeCount());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setTimeAgo(getTimeAgo(comment.getCreatedAt()));
        dto.setIsLiked(false); // TODO: 실제 좋아요 여부 확인
        return dto;
    }
    
    // 시간 표시 변환
    private String getTimeAgo(LocalDateTime dateTime) {
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        
        if (duration.toMinutes() < 1) {
            return "방금";
        } else if (duration.toMinutes() < 60) {
            return duration.toMinutes() + "분 전";
        } else if (duration.toHours() < 24) {
            return duration.toHours() + "시간 전";
        } else if (duration.toDays() < 7) {
            return duration.toDays() + "일 전";
        } else if (duration.toDays() < 30) {
            return (duration.toDays() / 7) + "주 전";
        } else if (duration.toDays() < 365) {
            return (duration.toDays() / 30) + "개월 전";
        } else {
            return (duration.toDays() / 365) + "년 전";
        }
    }
}