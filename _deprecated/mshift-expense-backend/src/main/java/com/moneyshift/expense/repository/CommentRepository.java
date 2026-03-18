package com.moneyshift.expense.repository;

import com.moneyshift.expense.entity.Comment;
import com.moneyshift.expense.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostAndIsDeletedFalseOrderByCreatedAtDesc(Post post);
    List<Comment> findByPostIdAndIsDeletedFalseOrderByCreatedAtDesc(Long postId);
    Long countByPostAndIsDeletedFalse(Post post);
}