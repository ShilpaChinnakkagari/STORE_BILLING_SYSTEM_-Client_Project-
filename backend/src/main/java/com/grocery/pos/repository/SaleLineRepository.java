package com.grocery.pos.repository;

import com.grocery.pos.entity.SaleLine;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleLineRepository extends JpaRepository<SaleLine, Long> {
    List<SaleLine> findBySale_Invoice(String invoice);
}