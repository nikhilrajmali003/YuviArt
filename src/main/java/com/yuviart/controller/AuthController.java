package com.yuviart.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.yuviart.dto.LoginRequest;
import com.yuviart.dto.RegisterRequest;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // TODO: Implement actual registration logic
            // 1. Validate input
            if (request.getName() == null || request.getEmail() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
            }
            
            // 2. Check if email exists
            // 3. Hash password (use BCrypt)
            // 4. Save user to database
            // 5. Generate JWT token
            // 6. Return token + user info

            Map<String, Object> response = new HashMap<>();
            response.put("token", "jwt_token_here");
            response.put("user", Map.of(
                "id", 1,
                "name", request.getName(),
                "email", request.getEmail(),
                "phone", request.getPhone() != null ? request.getPhone() : ""
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // TODO: Implement actual login logic
            // 1. Validate input
            if (request.getEmail() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }
            
            // 2. Find user by email
            // 3. Verify password (use BCrypt)
            // 4. Generate JWT token
            // 5. Return token + user info

            Map<String, Object> response = new HashMap<>();
            response.put("token", "jwt_token_here");
            response.put("user", Map.of(
                "id", 1,
                "name", "User Name",
                "email", request.getEmail()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            // TODO: Verify JWT token and return user info
            // 1. Extract token from Bearer header
            // 2. Validate JWT token
            // 3. Get user from database
            // 4. Return user info
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", 1);
            userInfo.put("name", "User Name");
            userInfo.put("email", "user@example.com");
            userInfo.put("phone", "+91 9876543210");
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Unauthorized: " + e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        try {
            // TODO: Implement logout logic
            // 1. Invalidate JWT token (add to blacklist)
            // 2. Clear session if using sessions
            
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Logout failed: " + e.getMessage()));
        }
    }
}