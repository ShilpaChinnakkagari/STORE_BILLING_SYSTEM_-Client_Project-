package com.grocery.pos.controller;

import com.grocery.pos.dto.LoginRequestDTO;
import com.grocery.pos.dto.LoginResponseDTO;
import com.grocery.pos.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }
    
    @PostMapping("/logout")
    public String logout() {
        // JWT is stateless, logout is handled client-side by removing token
        return "Logged out successfully";
    }
}