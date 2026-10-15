package com.banking.services;

import com.banking.dto.TransactionAnomalyResponse;
import com.banking.entity.BankAccount;
import com.banking.entity.Transaction;
import com.banking.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AnomalyDetectionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<TransactionAnomalyResponse> getAttentionQueue() {
        List<Transaction> transactions = transactionRepository.findAll(
                PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        double averageOutgoing = transactions.stream()
                .filter(this::isOutgoing)
                .mapToDouble(transaction -> valueOrZero(transaction.getAmount()))
                .average()
                .orElse(0.0);

        return transactions.stream()
                .map(transaction -> score(transaction, averageOutgoing, transactions))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(TransactionAnomalyResponse::riskScore).reversed())
                .limit(20)
                .collect(Collectors.toList());
    }

    @Deprecated
    public List<TransactionAnomalyResponse> getMockAttentionQueue() {
        return List.of(
                new TransactionAnomalyResponse(
                        "HIGH",
                        "****4821",
                        87,
                        "Transfer pattern is significantly different from normal activity",
                        List.of(
                                "Transfer amount is 4x the recent average",
                                "Multiple transfers occurred within a short period",
                                "82% of the daily transfer limit was used"
                        )
                ),
                new TransactionAnomalyResponse(
                        "MEDIUM",
                        "****1190",
                        64,
                        "Account is approaching an unusual activity threshold",
                        List.of(
                                "Outgoing activity increased recently",
                                "Transfer-limit usage is elevated"
                        )
                )
        );
    }

        private TransactionAnomalyResponse score(Transaction transaction, double averageOutgoing, List<Transaction> allTransactions) {
                if (!isOutgoing(transaction) || transaction.getFromAccount() == null) return null;

                BankAccount account = transaction.getFromAccount();
                double amount = valueOrZero(transaction.getAmount());
                int risk = 0;
                List<String> factors = new java.util.ArrayList<>();

                if (averageOutgoing > 0 && amount >= averageOutgoing * 2) {
                        risk += 40;
                        factors.add("Transaction amount is at least 2x the outgoing average");
                } else if (averageOutgoing > 0 && amount >= averageOutgoing * 1.5) {
                        risk += 25;
                        factors.add("Transaction amount is above the outgoing average");
                }

                long recentOutgoing = allTransactions.stream()
                                .filter(this::isOutgoing)
                                .filter(other -> other.getFromAccount() != null
                                                && other.getFromAccount().getAccountNumber().equals(account.getAccountNumber()))
                                .filter(other -> other.getCreatedAt() != null && transaction.getCreatedAt() != null
                                                && Math.abs(Duration.between(other.getCreatedAt(), transaction.getCreatedAt()).toMinutes()) <= 60)
                                .count();
                if (recentOutgoing >= 3) {
                        risk += 30;
                        factors.add("Multiple outgoing transactions occurred within one hour");
                }

                double balance = valueOrZero(account.getBalance());
                if (balance > 0 && amount / balance >= 0.5) {
                        risk += 20;
                        factors.add("Transaction is at least 50% of the account balance");
                }

                double limitUsage = percentage(account.getDailyTransferUsed(), account.getDailyTransferLimit());
                if (limitUsage >= 80) {
                        risk += 20;
                        factors.add("Account used at least 80% of its daily transfer limit");
                }

                if (risk == 0) return null;
                risk = Math.min(100, risk);
                String priority = risk >= 70 ? "HIGH" : risk >= 40 ? "MEDIUM" : "LOW";
                return new TransactionAnomalyResponse(
                                priority,
                                maskAccount(account.getAccountNumber()),
                                risk,
                                "Transaction requires administrator review",
                                factors
                );
        }

        private boolean isOutgoing(Transaction transaction) {
                return transaction.getType() == Transaction.TransactionType.WITHDRAW
                                || transaction.getType() == Transaction.TransactionType.TRANSFER_OUT;
        }

        private double percentage(Double value, Double limit) {
                if (limit == null || limit <= 0) return 100.0;
                return valueOrZero(value) / limit * 100;
        }

        private double valueOrZero(Double value) {
                return value == null ? 0.0 : value;
        }

        private String maskAccount(Long accountNumber) {
                String value = String.valueOf(accountNumber);
                return "****" + value.substring(Math.max(0, value.length() - 4));
        }
}
