package com.grocery.pos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class DailyReportDTO {
    private LocalDate date;
    private int totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalProfit;
    private BigDecimal totalDiscount;
    private BigDecimal totalTax;
    private List<SaleSummaryDTO> sales = new ArrayList<>();

    // Default constructor
    public DailyReportDTO() {}

    // Getters and Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getTotalProfit() { return totalProfit; }
    public void setTotalProfit(BigDecimal totalProfit) { this.totalProfit = totalProfit; }

    public BigDecimal getTotalDiscount() { return totalDiscount; }
    public void setTotalDiscount(BigDecimal totalDiscount) { this.totalDiscount = totalDiscount; }

    public BigDecimal getTotalTax() { return totalTax; }
    public void setTotalTax(BigDecimal totalTax) { this.totalTax = totalTax; }

    public List<SaleSummaryDTO> getSales() { return sales; }
    public void setSales(List<SaleSummaryDTO> sales) { this.sales = sales; }
}