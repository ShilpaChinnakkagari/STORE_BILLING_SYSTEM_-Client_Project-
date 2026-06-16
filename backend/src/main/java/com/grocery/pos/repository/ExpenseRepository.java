package com.grocery.pos.repository;

import com.grocery.pos.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findByExpenseDateBetween(LocalDate start, LocalDate end);
    List<Expense> findByCategory(String category);
    List<Expense> findByExpenseDate(LocalDate date);
}