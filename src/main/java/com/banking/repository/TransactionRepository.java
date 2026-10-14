package com.banking.repository;

import com.banking.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionRef(String transactionRef);

    @Query("SELECT t FROM Transaction t WHERE t.fromAccount.accountNumber = :accountNumber OR t.toAccount.accountNumber = :accountNumber ORDER BY t.createdAt DESC")
    Page<Transaction> findTransactionsByAccount(@Param("accountNumber") Long accountNumber, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.fromAccount.accountNumber = :accountNumber ORDER BY t.createdAt DESC")
    Page<Transaction> findOutgoingTransactions(@Param("accountNumber") Long accountNumber, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.toAccount.accountNumber = :accountNumber ORDER BY t.createdAt DESC")
    Page<Transaction> findIncomingTransactions(@Param("accountNumber") Long accountNumber, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount.accountNumber = :accountNumber OR t.toAccount.accountNumber = :accountNumber) AND t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    Page<Transaction> findTransactionsByAccountAndDateRange(@Param("accountNumber") Long accountNumber, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
}
