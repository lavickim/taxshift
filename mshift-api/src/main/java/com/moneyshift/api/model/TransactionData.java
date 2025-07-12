package com.moneyshift.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionData {
    private AccountInfo accountInfo;
    private List<Transaction> transactions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountInfo {
        private String bankName;
        private String accountNumber;
        private String balance;
        private String currency;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Transaction {
        private String id;
        private String date;
        private String displayDate;
        private String description;
        private Long amount;
        private String displayAmount;
        private Long balance;
        private String displayBalance;
        private String category;
        private String type;
    }
}