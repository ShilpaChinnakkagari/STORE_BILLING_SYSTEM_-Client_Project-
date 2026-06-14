package com.grocery.pos.controller;

import com.grocery.pos.dto.SaleRequestDTO;
import com.grocery.pos.entity.Sale;
import com.grocery.pos.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
public class SaleController {
    
    @Autowired
    private SaleService saleService;
    
    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.getAllSales();
    }
    
    @GetMapping("/{invoice}")
    public Sale getSaleByInvoice(@PathVariable String invoice) {
        return saleService.getSaleByInvoice(invoice);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sale createSale(@RequestBody SaleRequestDTO request) {
        return saleService.createSale(request);
    }
}