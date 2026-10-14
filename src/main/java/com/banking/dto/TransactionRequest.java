package com.banking.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TransactionRequest
{


    @NotNull(message = "Account number is required")
    private Long accountNumber;

    @Positive(message = "Amount must be greater than 0")
    private Double amount;

    public Long getAccountNumber()
    {
        return accountNumber;
    }

    public void setAccountNumber(long accountNumber)
    {
        this.accountNumber = accountNumber;
    }

    public Double getAmount()
    {
        return amount;
    }

    public void setAmount(double amount)
    {
        this.amount = amount;
    }




}
