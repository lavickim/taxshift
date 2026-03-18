package com.moneyshift.expense.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private Long id;
    private String author;
    private Long authorId;
    private String title;
    private String content;
    private String category;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean hasImage;
    private String imageUrl;
    private Boolean isLiked;
    private LocalDateTime createdAt;
    private String timeAgo;
    private List<CommentDto> comments;
}