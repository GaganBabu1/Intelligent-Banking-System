package com.banking.services;

import com.banking.dto.TransactionDTO;
import com.banking.entity.Transaction;
import com.banking.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TransactionHistoryService {

    private final TransactionRepository transactionRepository;

    public TransactionHistoryService(
            TransactionRepository transactionRepository
    ) {
        this.transactionRepository = transactionRepository;
    }

    public Page<TransactionDTO> getTransactionHistory(
            Long accountNumber,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        return transactionRepository
                .findTransactionsByAccount(accountNumber, pageable)
                .map(this::toDTO);
    }

    public Page<TransactionDTO> getOutgoingTransactions(
            Long accountNumber,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        return transactionRepository
                .findOutgoingTransactions(accountNumber, pageable)
                .map(this::toDTO);
    }

    public Page<TransactionDTO> getIncomingTransactions(
            Long accountNumber,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        return transactionRepository
                .findIncomingTransactions(accountNumber, pageable)
                .map(this::toDTO);
    }

    public TransactionDTO getTransactionByRef(String transactionRef) {
        return transactionRepository
                .findByTransactionRef(transactionRef)
                .map(this::toDTO)
                .orElse(null);
    }

    private TransactionDTO toDTO(Transaction transaction) {
        return new TransactionDTO(
                transaction.getId(),
                transaction.getTransactionRef(),
                transaction.getFromAccount() != null
                        ? transaction.getFromAccount().getAccountNumber()
                        : null,
                transaction.getToAccount() != null
                        ? transaction.getToAccount().getAccountNumber()
                        : null,
                transaction.getAmount(),
                transaction.getType().toString(),
                transaction.getStatus().toString(),
                transaction.getCreatedAt(),
                transaction.getDescription(),
                transaction.getBalanceBefore(),
                transaction.getBalanceAfter()
        );
    }
}