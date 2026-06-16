package com.grocery.pos.controller;

import com.grocery.pos.dto.ItemReportDTO;
import com.grocery.pos.entity.Item;
import com.grocery.pos.entity.SaleLine;
import com.grocery.pos.repository.ItemRepository;
import com.grocery.pos.repository.SaleLineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports/items")
@CrossOrigin(origins = "*")
public class ItemReportController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private SaleLineRepository saleLineRepository;

    @GetMapping("/inventory")
    public List<ItemReportDTO> getInventoryReport() {
        List<Item> items = itemRepository.findAll();
        List<ItemReportDTO> report = new ArrayList<>();

        // Get all sale lines to calculate sold quantities
        List<SaleLine> saleLines = saleLineRepository.findAll();
        
        // Group sale lines by item code and sum quantities
        Map<String, BigDecimal> soldMap = new HashMap<>();
        for (SaleLine saleLine : saleLines) {
            String itemCode = saleLine.getItem().getCode();
            BigDecimal quantity = saleLine.getQuantity() != null ? saleLine.getQuantity() : BigDecimal.ZERO;
            soldMap.put(itemCode, soldMap.getOrDefault(itemCode, BigDecimal.ZERO).add(quantity));
        }

        for (Item item : items) {
            ItemReportDTO dto = new ItemReportDTO();
            dto.setCode(item.getCode());
            dto.setName(item.getName());
            dto.setCategory(item.getCategory());
            dto.setUnit(item.getUnit().toString());
            dto.setPrice(item.getPrice());
            dto.setCost(item.getCost() != null ? item.getCost() : BigDecimal.ZERO);
            
            // Stock
            BigDecimal stock = item.getStock() != null ? item.getStock() : BigDecimal.ZERO;
            dto.setStock(stock);
            
            // Sold
            BigDecimal sold = soldMap.getOrDefault(item.getCode(), BigDecimal.ZERO);
            dto.setSold(sold);
            
            // Profit per unit
            BigDecimal profit = dto.getPrice().subtract(dto.getCost());
            dto.setProfit(profit);
            
            // Margin % = (Profit / Price) * 100
            BigDecimal margin = BigDecimal.ZERO;
            if (dto.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                margin = profit.divide(dto.getPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);
            }
            dto.setMargin(margin);
            
            // Stock Value = Stock * Cost
            BigDecimal stockValue = stock.multiply(dto.getCost());
            dto.setStockValue(stockValue);
            
            // Priority: 1 = highest (lowest stock)
            int priority = 4;
            if (stock.compareTo(BigDecimal.valueOf(5)) <= 0) {
                priority = 1;
            } else if (stock.compareTo(BigDecimal.valueOf(10)) <= 0) {
                priority = 2;
            } else if (stock.compareTo(BigDecimal.valueOf(20)) <= 0) {
                priority = 3;
            }
            dto.setPriority(priority);
            
            report.add(dto);
        }

        // Sort by priority (low stock first), then by stock ascending
        report.sort((a, b) -> {
            if (a.getPriority() != b.getPriority()) {
                return Integer.compare(a.getPriority(), b.getPriority());
            }
            return a.getStock().compareTo(b.getStock());
        });

        return report;
    }

    @GetMapping("/low-stock")
    public List<ItemReportDTO> getLowStockItems() {
        List<ItemReportDTO> allItems = getInventoryReport();
        return allItems.stream()
            .filter(item -> item.getStock().compareTo(BigDecimal.valueOf(10)) <= 0)
            .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/top-selling")
    public List<ItemReportDTO> getTopSellingItems() {
        List<ItemReportDTO> allItems = getInventoryReport();
        return allItems.stream()
            .filter(item -> item.getSold().compareTo(BigDecimal.ZERO) > 0)
            .sorted((a, b) -> b.getSold().compareTo(a.getSold()))
            .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/most-profitable")
    public List<ItemReportDTO> getMostProfitableItems() {
        List<ItemReportDTO> allItems = getInventoryReport();
        return allItems.stream()
            .sorted((a, b) -> b.getMargin().compareTo(a.getMargin()))
            .collect(java.util.stream.Collectors.toList());
    }
}