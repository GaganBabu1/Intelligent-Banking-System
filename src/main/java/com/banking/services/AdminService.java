package com.banking.services;

import com.banking.dto.BankAccountResponse;
import com.banking.dto.UserDTO;
import com.banking.entity.BankAccount;
import com.banking.entity.User;
import com.banking.repository.BankAccountRepository;
import com.banking.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final AccountService accountService;

    public AdminService(
            UserRepository userRepository,
            BankAccountRepository bankAccountRepository,
            AccountService accountService
    ) {
        this.userRepository = userRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.accountService = accountService;
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<BankAccountResponse> getAllAccounts(
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        return bankAccountRepository.findAll(pageable)
                .map(this::toAccountResponse);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSystemStatistics() {
        Long totalAccounts =
                bankAccountRepository.getTotalAccountCount();

        Double totalActiveBalance =
                bankAccountRepository.getTotalActiveBalance();

        long totalUsers = userRepository.count();

        long activeAccounts =
                bankAccountRepository
                        .findAllActiveAccounts(PageRequest.of(0, 1))
                        .getTotalElements();

        long frozenAccounts =
                bankAccountRepository
                        .findAllFrozenAccounts(PageRequest.of(0, 1))
                        .getTotalElements();

        return Map.of(
                "totalUsers", totalUsers,
                "totalAccounts", totalAccounts,
                "totalActiveBalance",
                totalActiveBalance == null ? 0.0 : totalActiveBalance,
                "activeAccounts", activeAccounts,
                "frozenAccounts", frozenAccounts
        );
    }

    public void disableUser(Long userId) {
        User user = getUser(userId);
        user.setEnabled(false);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }

    public void lockUser(Long userId) {
        User user = getUser(userId);
        user.setAccountNonLocked(false);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }

    public BankAccountResponse freezeAccount(
            Long accountNumber,
            String reason
    ) {
        return accountService.freezeAccount(accountNumber, reason);
    }

    public BankAccountResponse unfreezeAccount(Long accountNumber) {
        return accountService.unfreezeAccount(accountNumber);
    }

    public BankAccountResponse closeAccount(Long accountNumber) {
        return accountService.closeAccount(accountNumber);
    }

    public void resetDailyTransferLimit() {
        accountService.resetDailyTransferLimit();
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + userId)
                );
    }

    private UserDTO toUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getRole().toString(),
                user.getEnabled(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }

    private BankAccountResponse toAccountResponse(
            BankAccount account
    ) {
        return new BankAccountResponse(
                account.getAccountNumber(),
                account.getUser() != null
                        ? account.getUser().getId()
                        : null,
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