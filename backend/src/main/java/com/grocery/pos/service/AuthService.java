package com.grocery.pos.service;

import com.grocery.pos.dto.LoginRequestDTO;
import com.grocery.pos.dto.LoginResponseDTO;
import com.grocery.pos.entity.User;
import com.grocery.pos.repository.UserRepository;
import com.grocery.pos.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public LoginResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        if (!user.getPasswordHash().equals(request.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        
        return new LoginResponseDTO(
            token,
            user.getEmail(),
            user.getRole().name(),
            user.getFullName()
        );
    }
}