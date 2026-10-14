package com.banking.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;


public class CreateAccountRequest
{

    @NotBlank(message = "Account holder name is required")
    private String accountHolderName;
    @Positive(message = "Initial balance must be positive")
    private double balance;

    public String getAccountHolderName()
    {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName)
    {
        this.accountHolderName = accountHolderName;
    }

    public double getBalance()
    {
        return balance;
    }

    public void setBalance(double balance)
    {
        this.balance = balance;
    }
}
