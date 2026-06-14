package com.grocery.pos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Item {
    
    @Id
    @Column(name = "code", length = 50)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Unit unit;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal cost;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal mrp;
    
    @Column(precision = 10, scale = 3)
    private BigDecimal stock;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum Unit {
        pcs, kg, g, litre, ml
    }
}