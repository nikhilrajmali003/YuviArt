package com.yuviart.controller;

import com.yuviart.model.Admin;
import com.yuviart.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private AdminRepository adminRepository;
    
    /**
     * Signup - Create new admin account
     * POST /api/admin/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Admin admin) {
        try {
            // Validate input
            if (admin.getEmail() == null || admin.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }
            
            if (admin.getName() == null || admin.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Name is required"));
            }
            
            if (admin.getPassword() == null || admin.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body(createErrorResponse("Password must be at least 6 characters"));
            }
            
            // Check if email already exists
            if (adminRepository.existsByEmail(admin.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(createErrorResponse("Email already registered"));
            }
            
            // Set default values
            admin.setRole("ADMIN");
            admin.setIsActive(true);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            
            // Save admin
            Admin savedAdmin = adminRepository.save(admin);
            
            // Remove password from response
            savedAdmin.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account created successfully");
            response.put("admin", savedAdmin);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Signup failed: " + e.getMessage()));
        }
    }
    
    /**
     * Login - Authenticate admin
     * POST /api/admin/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            
            // Validate input
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }
            
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Password is required"));
            }
            
            // Find admin by email
            Admin admin = adminRepository.findByEmail(email).orElse(null);
            
            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Invalid credentials"));
            }
            
            // Check if admin is active
            if (!admin.getIsActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Account is disabled. Contact administrator."));
            }
            
            // Verify password (plain text comparison for now)
            // TODO: In production, use BCrypt password encoding
            if (!password.equals(admin.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Invalid credentials"));
            }
            
            // Update last login time
            admin.setLastLogin(LocalDateTime.now());
            adminRepository.save(admin);
            
            // Generate token (simple UUID for now)
            // TODO: In production, use JWT tokens
            String token = UUID.randomUUID().toString();
            
            // Remove password from response
            admin.setPassword(null);
            
            // Create success response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("admin", admin);
            response.put("message", "Login successful");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Login failed: " + e.getMessage()));
        }
    }
    
    /**
     * Get Admin Profile
     * GET /api/admin/profile/{id}
     */
    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        try {
            Admin admin = adminRepository.findById(id).orElse(null);
            
            if (admin == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Admin not found"));
            }
            
            // Remove password from response
            admin.setPassword(null);
            
            return ResponseEntity.ok(admin);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error fetching profile: " + e.getMessage()));
        }
    }
    
    /**
     * Logout - Invalidate session
     * POST /api/admin/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        // If you implement session/token table, invalidate the token here
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update Admin Profile
     * PUT /api/admin/profile/{id}
     */
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        try {
            Admin admin = adminRepository.findById(id).orElse(null);
            
            if (admin == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Admin not found"));
            }
            
            // Update allowed fields
            if (updates.containsKey("name")) {
                admin.setName(updates.get("name"));
            }
            
            if (updates.containsKey("email")) {
                String newEmail = updates.get("email");
                // Check if new email already exists
                if (!newEmail.equals(admin.getEmail()) && adminRepository.existsByEmail(newEmail)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(createErrorResponse("Email already in use"));
                }
                admin.setEmail(newEmail);
            }
            
            admin.setUpdatedAt(LocalDateTime.now());
            Admin updatedAdmin = adminRepository.save(admin);
            
            // Remove password from response
            updatedAdmin.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("admin", updatedAdmin);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Update failed: " + e.getMessage()));
        }
    }
    
    /**
     * Helper method to create error response
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return error;
    }
}