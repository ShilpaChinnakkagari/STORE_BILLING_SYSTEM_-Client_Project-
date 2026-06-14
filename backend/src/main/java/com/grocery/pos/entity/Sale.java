package com.grocery.pos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sale {
    
    @Id
    @Column(name = "invoice", length = 50)
    private String invoice;
    
    @Column(name = "sale_date", nullable = false)
    private LocalDateTime saleDate = LocalDateTime.now();
    
    @Column(name = "customer_name")
    private String customerName = "Customer";
    
    @Column(name = "cashier_name")
    private String cashierName;
    
    @Column(name = "sale_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private SaleType saleType;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal profit = BigDecimal.ZERO;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    public enum SaleType {
        Cash, Card, UPI, Credit
    }
}