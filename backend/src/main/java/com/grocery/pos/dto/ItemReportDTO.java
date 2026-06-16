package com.grocery.pos.dto;

import java.math.BigDecimal;

public class ItemReportDTO {
    private String code;
    private String name;
    private String category;
    private String unit;
    private BigDecimal price;
    private BigDecimal cost;
    private BigDecimal stock;
    private BigDecimal sold;
    private BigDecimal profit;
    private BigDecimal margin;
    private BigDecimal stockValue;
    private int priority;

    // Default constructor
    public ItemReportDTO() {}

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public BigDecimal getStock() { return stock; }
    public void setStock(BigDecimal stock) { this.stock = stock; }

    public BigDecimal getSold() { return sold; }
    public void setSold(BigDecimal sold) { this.sold = sold; }

    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }

    public BigDecimal getMargin() { return margin; }
    public void setMargin(BigDecimal margin) { this.margin = margin; }

    public BigDecimal getStockValue() { return stockValue; }
    public void setStockValue(BigDecimal stockValue) { this.stockValue = stockValue; }

    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
}