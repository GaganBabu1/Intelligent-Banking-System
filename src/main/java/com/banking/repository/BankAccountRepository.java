package com.banking.repository;

import com.banking.entity.BankAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    @Query("SELECT ba FROM BankAccount ba WHERE ba.user.id = :userId")
    List<BankAccount> findByUserId(@Param("userId") Long userId);

    @Query("SELECT ba FROM BankAccount ba WHERE ba.user.email = :email")
    List<BankAccount> findByUserEmail(@Param("email") String email);

    @Query("SELECT ba FROM BankAccount ba WHERE ba.accountStatus = 'ACTIVE' ORDER BY ba.createdAt DESC")
    Page<BankAccount> findAllActiveAccounts(Pageable pageable);

    @Query("SELECT ba FROM BankAccount ba WHERE ba.accountStatus = 'FROZEN' ORDER BY ba.createdAt DESC")
    Page<BankAccount> findAllFrozenAccounts(Pageable pageable);

    @Query("SELECT COUNT(ba) FROM BankAccount ba")
    Long getTotalAccountCount();

    @Query("SELECT SUM(ba.balance) FROM BankAccount ba WHERE ba.accountStatus = 'ACTIVE'")
    Double getTotalActiveBalance();
}