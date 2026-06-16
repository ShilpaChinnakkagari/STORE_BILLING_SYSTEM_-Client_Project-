package com.grocery.pos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {
    
    @Id
    @Column(length = 50)
    private String id;
    
    @Column(name = "movement_date", nullable = false)
    private LocalDateTime movementDate = LocalDateTime.now();
    
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
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MovementType type;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal cost;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    @Column(length = 100)
    private String reference;
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum MovementType {
        IN, OUT
    }
}