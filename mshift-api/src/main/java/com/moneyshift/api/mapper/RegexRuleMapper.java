package com.moneyshift.api.mapper;

import com.moneyshift.api.model.RegexRule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RegexRuleMapper {
    
    List<RegexRule> selectAllActiveRules();
    
    List<RegexRule> selectRulesByCategory(@Param("category") String category);
    
    RegexRule selectRuleById(@Param("id") Long id);
    
    int insertRule(RegexRule rule);
    
    int updateRule(RegexRule rule);
    
    int deleteRule(@Param("id") Long id);
    
    int enableRule(@Param("id") Long id);
    
    int disableRule(@Param("id") Long id);
}