package com.moneyshift.expense.mapper;

import com.moneyshift.expense.model.User;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Optional;

/**
 * 사용자 데이터 접근 매퍼
 */
@Mapper
public interface UserMapper {
    
    @Select("SELECT * FROM users WHERE user_id = #{userId}")
    Optional<User> findById(@Param("userId") Long userId);
    
    @Select("SELECT * FROM users WHERE username = #{username}")
    Optional<User> findByUsername(@Param("username") String username);
    
    @Select("SELECT * FROM users WHERE email = #{email}")
    Optional<User> findByEmail(@Param("email") String email);
    
    @Insert("INSERT INTO users (username, email, password_hash, full_name, phone_number) " +
            "VALUES (#{username}, #{email}, #{passwordHash}, #{fullName}, #{phoneNumber})")
    @SelectKey(statement = "SELECT LASTVAL()", keyProperty = "userId", before = false, resultType = Long.class)
    int insert(User user);
    
    @Update("UPDATE users SET email = #{email}, full_name = #{fullName}, " +
            "phone_number = #{phoneNumber}, profile_image_url = #{profileImageUrl}, " +
            "updated_at = CURRENT_TIMESTAMP WHERE user_id = #{userId}")
    int update(User user);
    
    @Update("UPDATE users SET password_hash = #{passwordHash}, updated_at = CURRENT_TIMESTAMP " +
            "WHERE user_id = #{userId}")
    int updatePassword(@Param("userId") Long userId, @Param("passwordHash") String passwordHash);
    
    @Update("UPDATE users SET is_active = #{isActive}, updated_at = CURRENT_TIMESTAMP " +
            "WHERE user_id = #{userId}")
    int updateStatus(@Param("userId") Long userId, @Param("isActive") Boolean isActive);
    
    @Select("SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC")
    List<User> findAllActive();
}