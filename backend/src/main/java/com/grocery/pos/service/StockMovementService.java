package com.grocery.pos.service;

import com.grocery.pos.dto.StockMovementRequestDTO;
import com.grocery.pos.entity.Item;
import com.grocery.pos.entity.StockMovement;
import com.grocery.pos.entity.StockMovement.MovementType;
import com.grocery.pos.repository.ItemRepository;
import com.grocery.pos.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockMovementService {
    
    @Autowired
    private StockMovementRepository stockMovementRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Transactional
    public StockMovement recordStockIn(StockMovementRequestDTO request) {
        return recordMovement(request, MovementType.IN);
    }
    
    @Transactional
    public StockMovement recordStockOut(StockMovementRequestDTO request) {
        return recordMovement(request, MovementType.OUT);
    }
    
    private StockMovement recordMovement(StockMovementRequestDTO request, MovementType type) {
        Item item = itemRepository.findById(request.getItemCode())
            .orElseThrow(() -> new RuntimeException("Item not found: " + request.getItemCode()));
        
        // Update stock
        if (type == MovementType.IN) {
            BigDecimal newStock = item.getStock().add(request.getQuantity());
            item.setStock(newStock);
            if (request.getCost() != null) {
                item.setCost(request.getCost());
            }
        } else {
            if (item.getStock().compareTo(request.getQuantity()) < 0) {
                throw new RuntimeException("Insufficient stock! Available: " + item.getStock());
            }
            BigDecimal newStock = item.getStock().subtract(request.getQuantity());
            item.setStock(newStock);
        }
        itemRepository.save(item);
        
        // Create movement record
        StockMovement movement = new StockMovement();
        movement.setId("MV-" + System.currentTimeMillis() + "-" + item.getCode());
        movement.setItem(item);
        movement.setItemName(item.getName());
        movement.setUnit(item.getUnit());
        movement.setQuantity(request.getQuantity());
        movement.setType(type);
        movement.setCost(request.getCost());
        movement.setNote(request.getNote());
        movement.setReference(request.getReference());
        movement.setMovementDate(LocalDateTime.now());
        
        return stockMovementRepository.save(movement);
    }
    
    public List<StockMovement> getAllMovements() {
        return stockMovementRepository.findAll();
    }
    
    public List<StockMovement> getMovementsByItem(String itemCode) {
        return stockMovementRepository.findByItem_Code(itemCode);
    }
    
    public List<StockMovement> getMovementsByType(MovementType type) {
        return stockMovementRepository.findByType(type);
    }
}