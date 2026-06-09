package com.major.stockportfolio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    
    @GetMapping("/api/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Protected API is working!");
    }
    @GetMapping("/")
    public String home() {
    return "Stock Portfolio Backend is running!";
}
}