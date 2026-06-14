package com.grocery.pos.service;

import com.grocery.pos.dto.SaleRequestDTO;
import com.grocery.pos.entity.*;
import com.grocery.pos.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SaleService {
    
    @Autowired
    private SaleRepository saleRepository;
    
    @Autowired
    private SaleLineRepository saleLineRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Transactional
    public Sale createSale(SaleRequestDTO request) {
        // Calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        List<SaleLine> saleLines = new ArrayList<>();
        
        for (SaleRequestDTO.CartLineDTO cartLine : request.getCartLines()) {
            Item item = itemRepository.findById(cartLine.getItemCode())
                .orElseThrow(() -> new RuntimeException("Item not found: " + cartLine.getItemCode()));
            
            BigDecimal lineAmount = item.getPrice().multiply(cartLine.getQuantity());
            subtotal = subtotal.add(lineAmount);
            
            SaleLine saleLine = new SaleLine();
            saleLine.setItem(item);
            saleLine.setItemName(item.getName());
            saleLine.setUnit(item.getUnit());
            saleLine.setQuantity(cartLine.getQuantity());
            saleLine.setPrice(item.getPrice());
            saleLine.setCost(item.getCost());
            saleLine.setMrp(item.getMrp());
            saleLine.setAmount(lineAmount);
            saleLines.add(saleLine);
            
            // Update stock
            BigDecimal newStock = item.getStock().subtract(cartLine.getQuantity());
            item.setStock(newStock);
            itemRepository.save(item);
        }
        
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal taxable = subtotal.subtract(discount);
        BigDecimal tax = taxable.multiply(BigDecimal.valueOf(0.05)); // 5% tax
        BigDecimal total = taxable.add(tax);
        BigDecimal profit = subtotal.subtract(discount); // Simplified profit calculation
        
        // Create sale
        Sale sale = new Sale();
        sale.setInvoice(request.getInvoice());
        sale.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : "Customer");
        sale.setCashierName(request.getCashierName() != null ? request.getCashierName() : "Admin");
        sale.setSaleType(Sale.SaleType.valueOf(request.getSaleType()));
        sale.setSubtotal(subtotal);
        sale.setDiscount(discount);
        sale.setTax(tax);
        sale.setTotal(total);
        sale.setProfit(profit);
        sale.setSaleDate(LocalDateTime.now());
        
        Sale savedSale = saleRepository.save(sale);
        
        // Save sale lines
        for (SaleLine saleLine : saleLines) {
            saleLine.setSale(savedSale);
            saleLineRepository.save(saleLine);
        }
        
        return savedSale;
    }
    
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }
    
    public Sale getSaleByInvoice(String invoice) {
        return saleRepository.findById(invoice)
            .orElseThrow(() -> new RuntimeException("Sale not found: " + invoice));
    }
}