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

    public BankAccountResponse transfer(
        Long fromAccountNumber,
        Long toAccountNumber,
        Double amount
) {
        if (fromAccountNumber == null || toAccountNumber == null) {
    throw new InvalidAmountException(
            "Both sender and receiver accounts are required"
    );
}
    if (fromAccountNumber.equals(toAccountNumber)) {
        throw new InvalidAmountException(
                "Cannot transfer to the same account"
        );
    }

    if (amount == null || amount <= 0) {
        throw new InvalidAmountException(
                "Amount must be greater than 0"
        );
    }

    BankAccount sender = accountRepository.findById(fromAccountNumber)
            .orElseThrow(() ->
                    new AccountNotFoundException(fromAccountNumber)
            );

    BankAccount receiver = accountRepository.findById(toAccountNumber)
            .orElseThrow(() ->
                    new AccountNotFoundException(toAccountNumber)
            );

    ensureAccountIsActive(sender);
    ensureAccountIsActive(receiver);

    if (amount > sender.getBalance()) {
        throw new InsufficientBalanceException(
                "Insufficient balance for transfer"
        );
    }

    if (sender.getDailyTransferUsed() + amount
            > sender.getDailyTransferLimit()) {
        throw new IllegalStateException(
                "Daily transfer limit exceeded"
        );
    }

    Double senderBalanceBefore = sender.getBalance();
    Double receiverBalanceBefore = receiver.getBalance();

    sender.setBalance(sender.getBalance() - amount);
    sender.setDailyTransferUsed(
            sender.getDailyTransferUsed() + amount
    );
    sender.setUpdatedAt(LocalDateTime.now());

    receiver.setBalance(receiver.getBalance() + amount);
    receiver.setUpdatedAt(LocalDateTime.now());

    BankAccount savedSender = accountRepository.save(sender);
    BankAccount savedReceiver = accountRepository.save(receiver);

    LocalDateTime now = LocalDateTime.now();

    Transaction outgoingTransaction = new Transaction();
    outgoingTransaction.setFromAccount(savedSender);
    outgoingTransaction.setToAccount(savedReceiver);
    outgoingTransaction.setAmount(amount);
    outgoingTransaction.setType(
            Transaction.TransactionType.TRANSFER_OUT
    );
    outgoingTransaction.setStatus(
            Transaction.TransactionStatus.SUCCESS
    );
    outgoingTransaction.setDescription(
            "Transfer to account " + toAccountNumber
    );
    outgoingTransaction.setBalanceBefore(senderBalanceBefore);
    outgoingTransaction.setBalanceAfter(savedSender.getBalance());
    outgoingTransaction.setCreatedAt(now);
    transactionRepository.save(outgoingTransaction);

    Transaction incomingTransaction = new Transaction();
    incomingTransaction.setFromAccount(savedSender);
    incomingTransaction.setToAccount(savedReceiver);
    incomingTransaction.setAmount(amount);
    incomingTransaction.setType(
            Transaction.TransactionType.TRANSFER_IN
    );
    incomingTransaction.setStatus(
            Transaction.TransactionStatus.SUCCESS
    );
    incomingTransaction.setDescription(
            "Transfer from account " + fromAccountNumber
    );
    incomingTransaction.setBalanceBefore(receiverBalanceBefore);
    incomingTransaction.setBalanceAfter(savedReceiver.getBalance());
    incomingTransaction.setCreatedAt(now);
    transactionRepository.save(incomingTransaction);

    return toResponse(savedSender);
}
}