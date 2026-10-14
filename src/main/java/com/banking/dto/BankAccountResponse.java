package com.banking.dto;

import java.time.LocalDateTime;

public class BankAccountResponse {
    private Long accountNumber;
    private Long userId;
    private String accountHolderName;
    private Double balance;
    private Double dailyTransferLimit;
    private Double dailyTransferUsed;
    private String accountStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime freezeDate;
    private String freezeReason;

    public BankAccountResponse() {
    }

    public BankAccountResponse(Long accountNumber, Long userId, String accountHolderName, Double balance,
                              Double dailyTransferLimit, Double dailyTransferUsed, String accountStatus,
                              LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime freezeDate,
                              String freezeReason) {
        this.accountNumber = accountNumber;
        this.userId = userId;
        this.accountHolderName = accountHolderName;
        this.balance = balance;
        this.dailyTransferLimit = dailyTransferLimit;
        this.dailyTransferUsed = dailyTransferUsed;
        this.accountStatus = accountStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.freezeDate = freezeDate;
        this.freezeReason = freezeReason;
    }

    // Getters and Setters
    public Long getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(Long accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public Double getDailyTransferLimit() {
        return dailyTransferLimit;
    }

    public void setDailyTransferLimit(Double dailyTransferLimit) {
        this.dailyTransferLimit = dailyTransferLimit;
    }

    public Double getDailyTransferUsed() {
        return dailyTransferUsed;
    }

    public void setDailyTransferUsed(Double dailyTransferUsed) {
        this.dailyTransferUsed = dailyTransferUsed;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getFreezeDate() {
        return freezeDate;
    }

    public void setFreezeDate(LocalDateTime freezeDate) {
        this.freezeDate = freezeDate;
    }

    public String getFreezeReason() {
        return freezeReason;
    }

    public void setFreezeReason(String freezeReason) {
        this.freezeReason = freezeReason;
    }
}