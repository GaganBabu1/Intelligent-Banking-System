package com.banking.exception;

public class AccountNotFoundException extends RuntimeException {

    public AccountNotFoundException(Long accountNumber) {
        super("Account not found: " + accountNumber);
    }

    public AccountNotFoundException(String identifier) {
        super("Account or resource not found: " + identifier);
    }
}