package com.moneyshift.api.mapper;

import com.moneyshift.api.model.TagAccountMapping;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface TagAccountMappingMapper {
    
    @Select("SELECT * FROM tag_account_mappings ORDER BY priority DESC, account_code")
    List<TagAccountMapping> selectAll();
    
    @Select("SELECT * FROM tag_account_mappings WHERE tag_id = #{tagId} ORDER BY priority DESC")
    List<TagAccountMapping> selectByTagId(@Param("tagId") Long tagId);
    
    @Select("SELECT * FROM tag_account_mappings WHERE account_code = #{accountCode} ORDER BY priority DESC")
    List<TagAccountMapping> selectByAccountCode(@Param("accountCode") String accountCode);
    
    @Select("SELECT * FROM tag_account_mappings WHERE id = #{id}")
    TagAccountMapping selectById(@Param("id") Long id);
    
    @Insert("INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) " +
            "VALUES (#{tagId}, #{accountCode}, #{accountName}, #{mappingCondition, typeHandler=com.moneyshift.api.config.JsonNodeTypeHandler}::jsonb, #{isDefault}, #{priority}, #{confidenceBoost})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertTagAccountMapping(TagAccountMapping mapping);
    
    @Update("UPDATE tag_account_mappings SET " +
            "tag_id = #{tagId}, account_code = #{accountCode}, account_name = #{accountName}, " +
            "mapping_condition = #{mappingCondition, typeHandler=com.moneyshift.api.config.JsonNodeTypeHandler}::jsonb, is_default = #{isDefault}, " +
            "priority = #{priority}, confidence_boost = #{confidenceBoost} " +
            "WHERE id = #{id}")
    int updateTagAccountMapping(TagAccountMapping mapping);
    
    @Delete("DELETE FROM tag_account_mappings WHERE id = #{id}")
    int deleteTagAccountMapping(@Param("id") Long id);
    
    @Select("SELECT COUNT(*) FROM tag_account_mappings")
    long countAll();
    
    @Select("SELECT * FROM tag_account_mappings WHERE is_default = true ORDER BY priority DESC")
    List<TagAccountMapping> selectDefaultMappings();
    
    // Methods with JOIN for tags
    List<TagAccountMapping> selectAllWithTags();
    List<TagAccountMapping> selectByTagIdWithTags(@Param("tagId") Long tagId);
    List<TagAccountMapping> selectByAccountCodeWithTags(@Param("accountCode") String accountCode);
    TagAccountMapping selectByIdWithTags(@Param("id") Long id);
}