package com.grocery.pos.service;

import com.grocery.pos.dto.SaleRequestDTO;
import com.grocery.pos.entity.Item;
import com.grocery.pos.entity.Sale;
import com.grocery.pos.entity.SaleLine;
import com.grocery.pos.entity.StockMovement;
import com.grocery.pos.repository.ItemRepository;
import com.grocery.pos.repository.SaleRepository;
import com.grocery.pos.repository.StockMovementRepository;
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
    private ItemRepository itemRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Transactional
    public Sale createSale(SaleRequestDTO request) {
        try {
            System.out.println("🔄 Creating sale for invoice: " + request.getInvoice());
            
            String invoice = request.getInvoice();
            if (invoice == null || invoice.isEmpty()) {
                invoice = "INV-" + System.currentTimeMillis();
            }

            // Create sale
            Sale sale = new Sale();
            sale.setInvoice(invoice);
            sale.setSaleDate(LocalDateTime.now());
            sale.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : "Customer");
            sale.setCashierName(request.getCashierName() != null ? request.getCashierName() : "Admin");
            sale.setSaleType(request.getSaleType() != null ? Sale.SaleType.valueOf(request.getSaleType()) : Sale.SaleType.Cash);
            
            BigDecimal subtotal = BigDecimal.ZERO;
            BigDecimal totalProfit = BigDecimal.ZERO;
            List<SaleLine> saleLines = new ArrayList<>();

            System.out.println("📦 Processing " + request.getCartLines().size() + " cart lines");

            for (SaleRequestDTO.CartLineDTO lineDTO : request.getCartLines()) {
                System.out.println("🔍 Looking up item: " + lineDTO.getItemCode());
                
                Item item = itemRepository.findById(lineDTO.getItemCode())
                    .orElseThrow(() -> new RuntimeException("Item not found: " + lineDTO.getItemCode()));

                System.out.println("✅ Found item: " + item.getName() + " (Stock: " + item.getStock() + ")");

                // Check stock
                BigDecimal currentStock = item.getStock() != null ? item.getStock() : BigDecimal.ZERO;
                if (currentStock.compareTo(lineDTO.getQuantity()) < 0) {
                    throw new RuntimeException("Insufficient stock for item: " + item.getName() + 
                        ". Available: " + currentStock + ", Requested: " + lineDTO.getQuantity());
                }

                // Calculate line amount
                BigDecimal lineAmount = item.getPrice().multiply(lineDTO.getQuantity());
                subtotal = subtotal.add(lineAmount);

                // Calculate profit
                BigDecimal cost = item.getCost() != null ? item.getCost() : BigDecimal.ZERO;
                BigDecimal profitPerUnit = item.getPrice().subtract(cost);
                BigDecimal lineProfit = profitPerUnit.multiply(lineDTO.getQuantity());
                totalProfit = totalProfit.add(lineProfit);

                // Create sale line
                SaleLine saleLine = new SaleLine();
                saleLine.setSale(sale);
                saleLine.setItem(item);
                saleLine.setItemName(item.getName());
                saleLine.setUnit(item.getUnit());
                saleLine.setQuantity(lineDTO.getQuantity());
                saleLine.setPrice(item.getPrice());
                saleLine.setCost(cost);
                saleLine.setMrp(item.getMrp());
                saleLine.setAmount(lineAmount);
                saleLines.add(saleLine);

                // Update stock
                BigDecimal newStock = currentStock.subtract(lineDTO.getQuantity());
                item.setStock(newStock);
                itemRepository.save(item);

                // Create stock movement for sale (OUT)
                StockMovement movement = new StockMovement();
                movement.setId("MV-SALE-" + System.currentTimeMillis() + "-" + item.getCode());
                movement.setItem(item);
                movement.setItemName(item.getName());
                movement.setUnit(item.getUnit());
                movement.setQuantity(lineDTO.getQuantity());
                movement.setType(StockMovement.MovementType.OUT);
                movement.setCost(cost);
                movement.setNote("Sale: " + invoice);
                movement.setReference(invoice);
                movement.setMovementDate(LocalDateTime.now());
                stockMovementRepository.save(movement);
                
                System.out.println("✅ Added to cart: " + item.getName() + " x " + lineDTO.getQuantity());
            }

            // Calculate totals
            BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
            BigDecimal taxable = subtotal.subtract(discount);
            // Calculate tax (5% of taxable)
            BigDecimal tax = taxable.multiply(BigDecimal.valueOf(0.05));
            BigDecimal total = taxable.add(tax);

            sale.setSubtotal(subtotal);
            sale.setDiscount(discount);
            sale.setTax(tax);
            sale.setTotal(total);
            sale.setProfit(totalProfit);

            System.out.println("💾 Saving sale...");
            
            // Save sale
            Sale savedSale = saleRepository.save(sale);
            
            // Save all sale lines
            for (SaleLine saleLine : saleLines) {
                saleLine.setSale(savedSale);
            }
            
            System.out.println("✅ Sale saved successfully! Invoice: " + savedSale.getInvoice());
            return savedSale;

        } catch (Exception e) {
            System.err.println("❌ Error creating sale: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create sale: " + e.getMessage(), e);
        }
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAllByOrderBySaleDateDesc();
    }

    public Sale getSaleByInvoice(String invoice) {
        return saleRepository.findById(invoice)
            .orElseThrow(() -> new RuntimeException("Sale not found: " + invoice));
    }
}