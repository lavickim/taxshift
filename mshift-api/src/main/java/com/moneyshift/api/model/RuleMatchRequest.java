package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RuleMatchRequest {
    @NotBlank(message = "Input text cannot be blank")
    private String inputText;
    
    private String category;
    
    @NotNull(message = "Return all matches flag is required")
    private Boolean returnAllMatches = false;
}