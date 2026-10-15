package com.banking.dto;

import java.util.List;

public record TransactionAnomalyResponse(
        String priority,
        String accountReference,
        int riskScore,
        String reason,
        List<String> factors
) {
}