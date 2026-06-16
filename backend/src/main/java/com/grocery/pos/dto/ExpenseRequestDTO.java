package com.grocery.pos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequestDTO {
    private String id;
    private LocalDate expenseDate;
    private String category;
    private String description;
    private BigDecimal amount;
}