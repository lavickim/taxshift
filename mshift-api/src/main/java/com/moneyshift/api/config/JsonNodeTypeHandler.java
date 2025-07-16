package com.moneyshift.api.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.*;

@MappedTypes(JsonNode.class)
@MappedJdbcTypes(JdbcType.OTHER)
public class JsonNodeTypeHandler extends BaseTypeHandler<JsonNode> {
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, JsonNode parameter, JdbcType jdbcType) throws SQLException {
        try {
            String jsonString = objectMapper.writeValueAsString(parameter);
            ps.setObject(i, jsonString);
        } catch (JsonProcessingException e) {
            throw new SQLException("Error converting JsonNode to JSON string", e);
        }
    }

    @Override
    public JsonNode getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String jsonString = rs.getString(columnName);
        if (jsonString == null) {
            return null;
        }
        try {
            return objectMapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            throw new SQLException("Error parsing JSON string to JsonNode", e);
        }
    }

    @Override
    public JsonNode getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String jsonString = rs.getString(columnIndex);
        if (jsonString == null) {
            return null;
        }
        try {
            return objectMapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            throw new SQLException("Error parsing JSON string to JsonNode", e);
        }
    }

    @Override
    public JsonNode getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String jsonString = cs.getString(columnIndex);
        if (jsonString == null) {
            return null;
        }
        try {
            return objectMapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            throw new SQLException("Error parsing JSON string to JsonNode", e);
        }
    }
}