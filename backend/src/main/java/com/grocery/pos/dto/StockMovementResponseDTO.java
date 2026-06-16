package com.grocery.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponseDTO {
    private String id;
    private String itemCode;
    private String itemName;
    private String unit;
    private BigDecimal quantity;
    private String type;
    private BigDecimal cost;
    private String note;
    private String reference;
    private LocalDateTime movementDate;
}