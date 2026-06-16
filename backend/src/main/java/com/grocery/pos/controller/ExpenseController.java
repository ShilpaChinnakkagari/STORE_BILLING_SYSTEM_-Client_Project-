package com.grocery.pos.controller;

import com.grocery.pos.entity.Expense;
import com.grocery.pos.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
    
    @GetMapping("/date/{date}")
    public List<Expense> getExpensesByDate(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        return expenseRepository.findByExpenseDate(localDate);
    }
    
    @GetMapping("/category/{category}")
    public List<Expense> getExpensesByCategory(@PathVariable String category) {
        return expenseRepository.findByCategory(category);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Expense createExpense(@RequestBody Expense expense) {
        if (expense.getId() == null || expense.getId().isEmpty()) {
            expense.setId("EXP-" + System.currentTimeMillis());
        }
        if (expense.getExpenseDate() == null) {
            expense.setExpenseDate(LocalDate.now());
        }
        return expenseRepository.save(expense);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(@PathVariable String id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found with id: " + id);
        }
        expenseRepository.deleteById(id);
    }
}