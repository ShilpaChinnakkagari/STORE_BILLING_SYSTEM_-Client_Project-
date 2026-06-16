package com.grocery.pos.repository;

import com.grocery.pos.entity.StockMovement;
import com.grocery.pos.entity.StockMovement.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, String> {
    List<StockMovement> findByItem_Code(String itemCode);
    List<StockMovement> findByType(MovementType type);
    List<StockMovement> findByMovementDateBetween(LocalDateTime start, LocalDateTime end);
    List<StockMovement> findByItem_CodeAndType(String itemCode, MovementType type);
}