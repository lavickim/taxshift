package com.moneyshift.api.mapper;

import com.moneyshift.api.model.KeywordGroup;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface KeywordGroupMapper {
    
    List<KeywordGroup> selectAllActive();
    
    List<KeywordGroup> selectByCategory(@Param("category") String category);
    
    KeywordGroup selectById(@Param("id") Long id);
    
    int insertKeywordGroup(KeywordGroup keywordGroup);
    
    int updateKeywordGroup(KeywordGroup keywordGroup);
    
    int deleteKeywordGroup(@Param("id") Long id);
    
    int setActiveStatus(@Param("id") Long id, @Param("active") boolean active);
}