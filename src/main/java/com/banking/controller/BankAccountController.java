package com.banking.controller;

import com.banking.dto.BankAccountResponse;
import com.banking.dto.CreateAccountRequest;
import com.banking.dto.TransactionRequest;
import com.banking.services.AccountService;
import com.banking.services.TransactionService;
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

    public BankAccountController(
        AccountService accountService,
        TransactionService transactionService
) {
    this.accountService = accountService;
    this.transactionService = transactionService;
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
}