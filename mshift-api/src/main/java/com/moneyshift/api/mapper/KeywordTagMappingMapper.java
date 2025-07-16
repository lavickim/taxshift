package com.moneyshift.api.mapper;

import com.moneyshift.api.model.KeywordTagMapping;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface KeywordTagMappingMapper {
    
    List<KeywordTagMapping> selectAllActive();
    
    List<KeywordTagMapping> selectByKeywordGroupId(@Param("keywordGroupId") Long keywordGroupId);
    
    List<KeywordTagMapping> selectByTagId(@Param("tagId") Long tagId);
    
    KeywordTagMapping selectById(@Param("id") Long id);
    
    KeywordTagMapping selectByKeywordGroupAndTag(@Param("keywordGroupId") Long keywordGroupId, @Param("tagId") Long tagId);
    
    int insertKeywordTagMapping(KeywordTagMapping mapping);
    
    int updateKeywordTagMapping(KeywordTagMapping mapping);
    
    int deleteKeywordTagMapping(@Param("id") Long id);
    
    int setActiveStatus(@Param("id") Long id, @Param("active") boolean active);
    
    int updateUsageCount(@Param("id") Long id, @Param("increment") int increment);
    
    List<KeywordTagMapping> selectTopMappingsByUsage(@Param("limit") int limit);
    
    List<KeywordTagMapping> selectMappingsByConfidenceRange(@Param("minConfidence") double minConfidence, @Param("maxConfidence") double maxConfidence);
}