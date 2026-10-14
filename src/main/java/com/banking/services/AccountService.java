package com.banking.services;

import com.banking.dto.BankAccountResponse;
import com.banking.dto.CreateAccountRequest;
import com.banking.entity.BankAccount;
import com.banking.entity.User;
import com.banking.repository.BankAccountRepository;
import com.banking.repository.UserRepository;
import com.banking.exception.AccountNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AccountService {

    private final BankAccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountService(
            BankAccountRepository accountRepository,
            UserRepository userRepository
    ) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    public BankAccountResponse createAccount(
            CreateAccountRequest request,
            Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        BankAccount account = new BankAccount();
        account.setUser(user);
        account.setAccountHolderName(request.getAccountHolderName());
        account.setBalance(request.getBalance());
        account.setDailyTransferLimit(100000.0);
        account.setDailyTransferUsed(0.0);
        account.setAccountStatus(BankAccount.AccountStatus.ACTIVE);

        LocalDateTime now = LocalDateTime.now();
        account.setCreatedAt(now);
        account.setUpdatedAt(now);

        return toResponse(accountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public BankAccountResponse getAccount(Long accountNumber) {
        BankAccount account = accountRepository.findById(accountNumber)
                .orElseThrow(() ->
                        new IllegalArgumentException("Account not found: " + accountNumber)
                );

        return toResponse(account);
    }

    @Transactional(readOnly = true)
    public List<BankAccountResponse> getUserAccounts(Long userId) {
        return accountRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
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