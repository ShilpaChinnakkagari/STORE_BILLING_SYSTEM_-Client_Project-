package com.grocery.pos.controller;

import com.grocery.pos.entity.Item;
import com.grocery.pos.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {
    
    @Autowired
    private ItemRepository itemRepository;
    
    // Get all items
    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
    
    // Get item by code
    @GetMapping("/{code}")
    public Item getItemByCode(@PathVariable String code) {
        return itemRepository.findById(code)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found with code: " + code));
    }
    
    // Create new item
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item createItem(@RequestBody Item item) {
        if (itemRepository.existsById(item.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Item already exists with code: " + item.getCode());
        }
        return itemRepository.save(item);
    }
    
    // Update item
    @PutMapping("/{code}")
    public Item updateItem(@PathVariable String code, @RequestBody Item item) {
        if (!itemRepository.existsById(code)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found with code: " + code);
        }
        item.setCode(code);
        item.setUpdatedAt(java.time.LocalDateTime.now());
        return itemRepository.save(item);
    }
    
    // Delete item
    @DeleteMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable String code) {
        if (!itemRepository.existsById(code)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found with code: " + code);
        }
        itemRepository.deleteById(code);
    }
}