package com.grocery.pos.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping
    public Map<String, String> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Backend is working!");
        response.put("status", "success");
        response.put("time", java.time.LocalDateTime.now().toString());
        return response;
    }
}