package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.Post;
import com.moneyshift.expense.entity.CommunityUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findByCategoryAndIsDeletedFalseOrderByCreatedAtDesc(String category, Pageable pageable);
    Page<Post> findByAuthorAndIsDeletedFalseOrderByCreatedAtDesc(CommunityUser author, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false ORDER BY p.likeCount DESC, p.createdAt DESC")
    Page<Post> findPopularPosts(Pageable pageable);
    
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :postId")
    void incrementViewCount(Long postId);
    
    @Query("UPDATE Post p SET p.commentCount = p.commentCount + 1 WHERE p.id = :postId")
    void incrementCommentCount(Long postId);
    
    @Query("UPDATE Post p SET p.commentCount = p.commentCount - 1 WHERE p.id = :postId")
    void decrementCommentCount(Long postId);
}