package com.grocery.pos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StockMovementRequestDTO {
    private String itemCode;
    private BigDecimal quantity;
    private BigDecimal cost;  // For IN movements
    private String note;
    private String reference;
}