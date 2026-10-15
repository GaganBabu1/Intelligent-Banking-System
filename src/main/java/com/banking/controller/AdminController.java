package com.banking.controller;

import com.banking.dto.BankAccountResponse;
import com.banking.dto.UserDTO;
import com.banking.services.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000"
})
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/accounts")
    public ResponseEntity<Page<BankAccountResponse>> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                adminService.getAllAccounts(page, size)
        );
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(
                adminService.getSystemStatistics()
        );
    }

    @PostMapping("/users/{userId}/disable")
    public ResponseEntity<Void> disableUser(
            @PathVariable Long userId
    ) {
        adminService.disableUser(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{userId}/lock")
    public ResponseEntity<Void> lockUser(
            @PathVariable Long userId
    ) {
        adminService.lockUser(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/accounts/{accountNumber}/freeze")
    public ResponseEntity<BankAccountResponse> freezeAccount(
            @PathVariable Long accountNumber,
            @RequestBody(required = false)
            Map<String, String> request
    ) {
        String reason = request == null
                ? "Account frozen by admin"
                : request.getOrDefault(
                        "reason",
                        "Account frozen by admin"
                );

        return ResponseEntity.ok(
                adminService.freezeAccount(accountNumber, reason)
        );
    }

    @PostMapping("/accounts/{accountNumber}/unfreeze")
    public ResponseEntity<BankAccountResponse> unfreezeAccount(
            @PathVariable Long accountNumber
    ) {
        return ResponseEntity.ok(
                adminService.unfreezeAccount(accountNumber)
        );
    }

    @PostMapping("/accounts/{accountNumber}/close")
    public ResponseEntity<BankAccountResponse> closeAccount(
            @PathVariable Long accountNumber
    ) {
        return ResponseEntity.ok(
                adminService.closeAccount(accountNumber)
        );
    }

    @PostMapping("/reset-daily-limits")
    public ResponseEntity<Void> resetDailyLimits() {
        adminService.resetDailyTransferLimit();
        return ResponseEntity.noContent().build();
    }
}