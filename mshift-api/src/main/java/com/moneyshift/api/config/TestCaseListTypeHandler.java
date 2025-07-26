package com.moneyshift.api.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyshift.api.model.RegexPreprocessingRule;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * JSONB 타입을 List<TestCase>로 변환하는 TypeHandler
 */
@MappedTypes({List.class})
public class TestCaseListTypeHandler extends BaseTypeHandler<List<RegexPreprocessingRule.TestCase>> {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final TypeReference<List<RegexPreprocessingRule.TestCase>> typeRef = new TypeReference<List<RegexPreprocessingRule.TestCase>>() {};

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<RegexPreprocessingRule.TestCase> parameter, JdbcType jdbcType) throws SQLException {
        try {
            String json = objectMapper.writeValueAsString(parameter);
            ps.setObject(i, json, java.sql.Types.OTHER);
        } catch (Exception e) {
            throw new SQLException("Error converting List<TestCase> to JSON", e);
        }
    }

    @Override
    public List<RegexPreprocessingRule.TestCase> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        try {
            String json = rs.getString(columnName);
            if (json == null) return null;
            return objectMapper.readValue(json, typeRef);
        } catch (Exception e) {
            throw new SQLException("Error converting JSON to List<TestCase>", e);
        }
    }

    @Override
    public List<RegexPreprocessingRule.TestCase> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        try {
            String json = rs.getString(columnIndex);
            if (json == null) return null;
            return objectMapper.readValue(json, typeRef);
        } catch (Exception e) {
            throw new SQLException("Error converting JSON to List<TestCase>", e);
        }
    }

    @Override
    public List<RegexPreprocessingRule.TestCase> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        try {
            String json = cs.getString(columnIndex);
            if (json == null) return null;
            return objectMapper.readValue(json, typeRef);
        } catch (Exception e) {
            throw new SQLException("Error converting JSON to List<TestCase>", e);
        }
    }
}