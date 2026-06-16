package com.grocery.pos.service;

import com.grocery.pos.dto.ExpenseRequestDTO;
import com.grocery.pos.entity.Expense;
import com.grocery.pos.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    public Expense addExpense(ExpenseRequestDTO request) {
        Expense expense = new Expense();
        expense.setId(request.getId() != null ? request.getId() : "EXP-" + System.currentTimeMillis());
        expense.setExpenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        return expenseRepository.save(expense);
    }
    
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
    
    public List<Expense> getExpensesByDate(LocalDate date) {
        return expenseRepository.findByExpenseDate(date);
    }
    
    public List<Expense> getExpensesByDateRange(LocalDate start, LocalDate end) {
        return expenseRepository.findByExpenseDateBetween(start, end);
    }
    
    public List<Expense> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category);
    }
    
    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}