package com.banking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bank_account", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_account_status", columnList = "account_status")
})
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_number")
    private Long accountNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String accountHolderName;

    @Column(nullable = false)
    private Double balance = 0.0;

    @Column(nullable = false)
    private Double dailyTransferLimit = 100000.0;

    @Column(nullable = false)
    private Double dailyTransferUsed = 0.0;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime freezeDate;

    @Column(length = 500)
    private String freezeReason;

    @OneToMany(mappedBy = "fromAccount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Transaction> sentTransactions;

    @OneToMany(mappedBy = "toAccount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Transaction> receivedTransactions;

    public BankAccount() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.dailyTransferUsed = 0.0;
    }

    // Getters and Setters
    public Long getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(Long accountNumber) {
        this.accountNumber = accountNumber;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
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

    public List<Transaction> getSentTransactions() {
    return sentTransactions;
}

    public void setSentTransactions(List<Transaction> sentTransactions) {
        this.sentTransactions = sentTransactions;
    }

    public List<Transaction> getReceivedTransactions() {
        return receivedTransactions;
    }

    public void setReceivedTransactions(List<Transaction> receivedTransactions) {
        this.receivedTransactions = receivedTransactions;
    }

    public enum AccountStatus {
        ACTIVE, FROZEN, CLOSED
    }
}