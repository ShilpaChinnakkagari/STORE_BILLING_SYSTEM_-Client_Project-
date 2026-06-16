package com.grocery.pos.controller;

import com.grocery.pos.dto.StockMovementRequestDTO;
import com.grocery.pos.entity.StockMovement;
import com.grocery.pos.entity.StockMovement.MovementType;
import com.grocery.pos.service.StockMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin(origins = "*")
public class StockMovementController {
    
    @Autowired
    private StockMovementService stockMovementService;
    
    @GetMapping("/movements")
    public List<StockMovement> getAllMovements() {
        return stockMovementService.getAllMovements();
    }
    
    @GetMapping("/movements/item/{itemCode}")
    public List<StockMovement> getMovementsByItem(@PathVariable String itemCode) {
        return stockMovementService.getMovementsByItem(itemCode);
    }
    
    @GetMapping("/movements/type/{type}")
    public List<StockMovement> getMovementsByType(@PathVariable String type) {
        return stockMovementService.getMovementsByType(MovementType.valueOf(type.toUpperCase()));
    }
    
    @PostMapping("/in")
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovement recordStockIn(@RequestBody StockMovementRequestDTO request) {
        return stockMovementService.recordStockIn(request);
    }
    
    @PostMapping("/out")
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovement recordStockOut(@RequestBody StockMovementRequestDTO request) {
        return stockMovementService.recordStockOut(request);
    }
}