package com.grocery.pos.repository;

import com.grocery.pos.entity.SaleLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleLineRepository extends JpaRepository<SaleLine, Long> {
    
    // Find sale lines by invoice number
    List<SaleLine> findBySale_Invoice(String invoice);
    
    // Find sale lines by item code
    List<SaleLine> findByItem_Code(String itemCode);
    
    // Get all sale lines with item and sale details
    @Query("SELECT sl FROM SaleLine sl")
    List<SaleLine> findAllSaleLines();
}