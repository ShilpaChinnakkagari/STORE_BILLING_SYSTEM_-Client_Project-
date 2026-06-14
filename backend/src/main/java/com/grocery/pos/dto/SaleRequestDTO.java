package com.grocery.pos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequestDTO {
    private String invoice;
    private String customerName;
    private String cashierName;
    private String saleType;
    private BigDecimal discount;
    private List<CartLineDTO> cartLines;
    
    @Data
    public static class CartLineDTO {
        private String itemCode;
        private BigDecimal quantity;
    }
}