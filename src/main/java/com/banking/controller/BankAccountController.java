package com.banking.controller;

import com.banking.dto.BankAccountResponse;
import com.banking.dto.CreateAccountRequest;
import com.banking.dto.TransactionRequest;
import com.banking.services.AccountService;
import com.banking.services.TransactionService;
import com.banking.dto.TransferRequest;
import com.banking.dto.TransactionDTO;
import com.banking.services.TransactionHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RequestParam;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000"
})
public class BankAccountController {

    private final AccountService accountService;
    private final TransactionService transactionService;
    private final TransactionHistoryService transactionHistoryService;

    public BankAccountController(
        AccountService accountService,
        TransactionService transactionService,
        TransactionHistoryService transactionHistoryService
) {
    this.accountService = accountService;
    this.transactionService = transactionService;
    this.transactionHistoryService = transactionHistoryService;
}

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BankAccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request,
            Authentication authentication
    ) {
        Long userId = (Long) authentication.getDetails();

        if (userId == null || userId == 0L) {
            return ResponseEntity.badRequest().build();
        }

        BankAccountResponse response =
                accountService.createAccount(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BankAccountResponse> getAccount(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(accountService.getAccount(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BankAccountResponse>> getUserAccounts(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(accountService.getUserAccounts(userId));
    }

    @PostMapping("/deposit")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public ResponseEntity<BankAccountResponse> deposit(
        @Valid @RequestBody TransactionRequest request
) {
    BankAccountResponse response = transactionService.deposit(
            request.getAccountNumber(),
            request.getAmount()
    );

    return ResponseEntity.ok(response);
}

    @PostMapping("/withdraw")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BankAccountResponse> withdraw(
            @Valid @RequestBody TransactionRequest request
    ) {
        BankAccountResponse response = transactionService.withdraw(
                request.getAccountNumber(),
                request.getAmount()
        );

        return ResponseEntity.ok(response);
    }
    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BankAccountResponse> transfer(
            @Valid @RequestBody TransferRequest request
    ) {
        BankAccountResponse response = transactionService.transfer(
                request.getFromAccount(),
                request.getToAccount(),
                request.getAmount()
        );

        return ResponseEntity.ok(response);
    }

        @GetMapping("/{id}/transactions")
        @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
        public ResponseEntity<Page<TransactionDTO>> getTransactions(
                @PathVariable Long id,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "10") int size
        ) {
        return ResponseEntity.ok(
                transactionHistoryService.getTransactionHistory(id, page, size)
        );
        }

        @GetMapping("/{id}/transactions/outgoing")
        @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
        public ResponseEntity<Page<TransactionDTO>> getOutgoingTransactions(
                @PathVariable Long id,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "10") int size
        ) {
        return ResponseEntity.ok(
                transactionHistoryService.getOutgoingTransactions(id, page, size)
        );
        }

        @GetMapping("/{id}/transactions/incoming")
        @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
        public ResponseEntity<Page<TransactionDTO>> getIncomingTransactions(
                @PathVariable Long id,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "10") int size
        ) {
        return ResponseEntity.ok(
                transactionHistoryService.getIncomingTransactions(id, page, size)
        );
        }

        @GetMapping("/transaction/{transactionRef}")
        @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
        public ResponseEntity<TransactionDTO> getTransactionDetails(
                @PathVariable String transactionRef
        ) {
        TransactionDTO transaction =
                transactionHistoryService.getTransactionByRef(transactionRef);

        return transaction != null
                ? ResponseEntity.ok(transaction)
                : ResponseEntity.notFound().build();
        }
}