package com.banking;

import com.banking.dto.TransactionAnomalyResponse;
import com.banking.entity.BankAccount;
import com.banking.entity.Transaction;
import com.banking.repository.TransactionRepository;
import com.banking.services.AnomalyDetectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.time.LocalDateTime;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import static org.assertj.core.api.Assertions.assertThat;

class AnomalyDetectionServiceTests {

    private TransactionRepository transactionRepository;
    private AnomalyDetectionService service;

    @BeforeEach
    void setUp() throws Exception {
        transactionRepository = mock(TransactionRepository.class);
        service = new AnomalyDetectionService();
        var field = AnomalyDetectionService.class.getDeclaredField("transactionRepository");
        field.setAccessible(true);
        field.set(service, transactionRepository);
    }

    @Test
    void returnsExplainableLiveAttentionQueue() {
        BankAccount account = account(4821L, 10000.0, 100000.0, 82000.0);
        Transaction first = transaction(1L, account, 1000.0, LocalDateTime.now().minusMinutes(30));
        Transaction second = transaction(2L, account, 1000.0, LocalDateTime.now().minusMinutes(20));
        Transaction suspicious = transaction(3L, account, 4000.0, LocalDateTime.now().minusMinutes(10));
        when(transactionRepository.findAll(org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(suspicious, first, second)));

        List<TransactionAnomalyResponse> queue = service.getAttentionQueue();

        assertThat(queue).hasSize(3);
        assertThat(queue.get(0).priority()).isEqualTo("HIGH");
        assertThat(queue.get(0).riskScore()).isGreaterThanOrEqualTo(70);
        assertThat(queue.get(0).factors()).isNotEmpty();
    }

    private BankAccount account(Long number, double balance, double limit, double used) {
        BankAccount account = new BankAccount();
        account.setAccountNumber(number);
        account.setBalance(balance);
        account.setDailyTransferLimit(limit);
        account.setDailyTransferUsed(used);
        return account;
    }

    private Transaction transaction(Long id, BankAccount account, double amount, LocalDateTime createdAt) {
        Transaction transaction = new Transaction();
        transaction.setId(id);
        transaction.setFromAccount(account);
        transaction.setType(Transaction.TransactionType.TRANSFER_OUT);
        transaction.setAmount(amount);
        transaction.setCreatedAt(createdAt);
        return transaction;
    }
}
