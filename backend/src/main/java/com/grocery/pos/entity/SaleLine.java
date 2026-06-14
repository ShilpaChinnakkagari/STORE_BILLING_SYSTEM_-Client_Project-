package com.grocery.pos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleLine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "invoice", nullable = false)
    private Sale sale;
    
    @ManyToOne
    @JoinColumn(name = "item_code", nullable = false)
    private Item item;
    
    @Column(name = "item_name", nullable = false)
    private String itemName;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Item.Unit unit;
    
    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal cost;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal mrp;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
}