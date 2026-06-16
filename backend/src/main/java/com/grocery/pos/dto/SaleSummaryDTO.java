package com.grocery.pos.dto;

import java.math.BigDecimal;

public class SaleSummaryDTO {
    private String invoice;
    private String customerName;
    private BigDecimal total;
    private BigDecimal profit;
    private String saleType;

    // Default constructor
    public SaleSummaryDTO() {}

    // Constructor with fields
    public SaleSummaryDTO(String invoice, String customerName, BigDecimal total, BigDecimal profit, String saleType) {
        this.invoice = invoice;
        this.customerName = customerName;
        this.total = total;
        this.profit = profit;
        this.saleType = saleType;
    }

    // Getters and Setters
    public String getInvoice() { return invoice; }
    public void setInvoice(String invoice) { this.invoice = invoice; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }

    public String getSaleType() { return saleType; }
    public void setSaleType(String saleType) { this.saleType = saleType; }
}