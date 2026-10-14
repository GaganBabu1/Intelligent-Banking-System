package com.banking.services;

import com.banking.dto.BankAccountResponse;
import com.banking.entity.BankAccount;
import com.banking.entity.Transaction;
import com.banking.exception.AccountNotFoundException;
import com.banking.exception.InsufficientBalanceException;
import com.banking.exception.InvalidAmountException;
import com.banking.repository.BankAccountRepository;
import com.banking.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class TransactionService {

    private final BankAccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransactionService(
            BankAccountRepository accountRepository,
            TransactionRepository transactionRepository
    ) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public BankAccountResponse deposit(Long accountNumber, Double amount) {
        validateAmount(amount);

        BankAccount account = accountRepository.findById(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));

        ensureAccountIsActive(account);

        Double balanceBefore = account.getBalance();
        account.setBalance(balanceBefore + amount);
        account.setUpdatedAt(LocalDateTime.now());

        BankAccount savedAccount = accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setFromAccount(null);
        transaction.setToAccount(savedAccount);
        transaction.setAmount(amount);
        transaction.setType(Transaction.TransactionType.DEPOSIT);
        transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
        transaction.setDescription("Deposit of " + amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(savedAccount.getBalance());
        transactionRepository.save(transaction);

        return toResponse(savedAccount);
    }

    public BankAccountResponse withdraw(Long accountNumber, Double amount) {
        validateAmount(amount);

        BankAccount account = accountRepository.findById(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));

        ensureAccountIsActive(account);

        if (amount > account.getBalance()) {
            throw new InsufficientBalanceException(
                    "Insufficient balance for withdrawal"
            );
        }

        Double balanceBefore = account.getBalance();
        account.setBalance(balanceBefore - amount);
        account.setUpdatedAt(LocalDateTime.now());

        BankAccount savedAccount = accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setFromAccount(savedAccount);
        transaction.setToAccount(null);
        transaction.setAmount(amount);
        transaction.setType(Transaction.TransactionType.WITHDRAW);
        transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
        transaction.setDescription("Withdrawal of " + amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(savedAccount.getBalance());
        transactionRepository.save(transaction);

        return toResponse(savedAccount);
    }

    private void validateAmount(Double amount) {
        if (amount == null || amount <= 0) {
            throw new InvalidAmountException(
                    "Amount must be greater than 0"
            );
        }
    }

    private void ensureAccountIsActive(BankAccount account) {
        if (account.getAccountStatus() != BankAccount.AccountStatus.ACTIVE) {
            throw new IllegalStateException("Account is not active");
        }
    }

    private BankAccountResponse toResponse(BankAccount account) {
        return new BankAccountResponse(
                account.getAccountNumber(),
                account.getUser() != null ? account.getUser().getId() : null,
                account.getAccountHolderName(),
                account.getBalance(),
                account.getDailyTransferLimit(),
                account.getDailyTransferUsed(),
                account.getAccountStatus().toString(),
                account.getCreatedAt(),
                account.getUpdatedAt(),
                account.getFreezeDate(),
                account.getFreezeReason()
        );
    }
}