package com.grocery.pos.controller;

import com.grocery.pos.dto.DailyReportDTO;
import com.grocery.pos.dto.SaleSummaryDTO;
import com.grocery.pos.entity.Sale;
import com.grocery.pos.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private SaleRepository saleRepository;

    @GetMapping("/daily")
    public DailyReportDTO getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        
        List<Sale> sales = saleRepository.findBySaleDateBetween(start, end);
        
        DailyReportDTO report = new DailyReportDTO();
        report.setDate(date);
        report.setTotalOrders(sales.size());
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        
        for (Sale sale : sales) {
            totalRevenue = totalRevenue.add(sale.getTotal());
            totalProfit = totalProfit.add(sale.getProfit() != null ? sale.getProfit() : BigDecimal.ZERO);
            totalDiscount = totalDiscount.add(sale.getDiscount() != null ? sale.getDiscount() : BigDecimal.ZERO);
            totalTax = totalTax.add(sale.getTax() != null ? sale.getTax() : BigDecimal.ZERO);
        }
        
        report.setTotalRevenue(totalRevenue);
        report.setTotalProfit(totalProfit);
        report.setTotalDiscount(totalDiscount);
        report.setTotalTax(totalTax);
        
        // ✅ Fix: Convert SaleType enum to String
        List<SaleSummaryDTO> saleSummaries = sales.stream()
            .map(sale -> new SaleSummaryDTO(
                sale.getInvoice(),
                sale.getCustomerName(),
                sale.getTotal(),
                sale.getProfit(),
                sale.getSaleType() != null ? sale.getSaleType().toString() : "Cash"
            ))
            .collect(Collectors.toList());
        
        report.setSales(saleSummaries);
        
        return report;
    }

    @GetMapping("/monthly")
    public List<DailyReportDTO> getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month) {
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Sale> sales = saleRepository.findBySaleDateBetween(
            startDate.atStartOfDay(),
            endDate.atTime(LocalTime.MAX)
        );
        
        // Group by day
        Map<LocalDate, List<Sale>> salesByDay = sales.stream()
            .collect(Collectors.groupingBy(
                sale -> sale.getSaleDate().toLocalDate()
            ));
        
        return salesByDay.entrySet().stream()
            .map(entry -> {
                LocalDate date = entry.getKey();
                List<Sale> daySales = entry.getValue();
                
                DailyReportDTO report = new DailyReportDTO();
                report.setDate(date);
                report.setTotalOrders(daySales.size());
                
                BigDecimal totalRevenue = BigDecimal.ZERO;
                BigDecimal totalProfit = BigDecimal.ZERO;
                BigDecimal totalDiscount = BigDecimal.ZERO;
                BigDecimal totalTax = BigDecimal.ZERO;
                
                for (Sale sale : daySales) {
                    totalRevenue = totalRevenue.add(sale.getTotal());
                    totalProfit = totalProfit.add(sale.getProfit() != null ? sale.getProfit() : BigDecimal.ZERO);
                    totalDiscount = totalDiscount.add(sale.getDiscount() != null ? sale.getDiscount() : BigDecimal.ZERO);
                    totalTax = totalTax.add(sale.getTax() != null ? sale.getTax() : BigDecimal.ZERO);
                }
                
                report.setTotalRevenue(totalRevenue);
                report.setTotalProfit(totalProfit);
                report.setTotalDiscount(totalDiscount);
                report.setTotalTax(totalTax);
                
                // ✅ Fix: Convert SaleType enum to String
                List<SaleSummaryDTO> saleSummaries = daySales.stream()
                    .map(sale -> new SaleSummaryDTO(
                        sale.getInvoice(),
                        sale.getCustomerName(),
                        sale.getTotal(),
                        sale.getProfit(),
                        sale.getSaleType() != null ? sale.getSaleType().toString() : "Cash"
                    ))
                    .collect(Collectors.toList());
                
                report.setSales(saleSummaries);
                
                return report;
            })
            .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
            .collect(Collectors.toList());
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Sale> sales = saleRepository.findBySaleDateBetween(
            startDate.atStartOfDay(),
            endDate.atTime(LocalTime.MAX)
        );
        
        int totalOrders = sales.size();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        
        for (Sale sale : sales) {
            totalRevenue = totalRevenue.add(sale.getTotal());
            totalProfit = totalProfit.add(sale.getProfit() != null ? sale.getProfit() : BigDecimal.ZERO);
            totalDiscount = totalDiscount.add(sale.getDiscount() != null ? sale.getDiscount() : BigDecimal.ZERO);
            totalTax = totalTax.add(sale.getTax() != null ? sale.getTax() : BigDecimal.ZERO);
        }
        
        BigDecimal averageOrderValue = totalOrders > 0 ? 
            totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;
        
        // ✅ Fix: Use Map instead of anonymous object with self-reference
        return Map.of(
            "orders", totalOrders,
            "revenue", totalRevenue,
            "profit", totalProfit,
            "discount", totalDiscount,
            "tax", totalTax,
            "averageOrderValue", averageOrderValue,
            "from", startDate.toString(),
            "to", endDate.toString()
        );
    }
}