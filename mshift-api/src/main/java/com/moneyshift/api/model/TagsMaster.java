package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagsMaster {
    private Long id;
    private String tagName;
    private String tagCategory;
    private String description;
    private String colorHex;
    private String iconName;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
}