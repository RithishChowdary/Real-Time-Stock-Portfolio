package com.major.stockportfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.major.stockportfolio.dto.StockResearchRequest;
import com.major.stockportfolio.dto.StockResearchResponse;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.interfaces.StockResearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/research")
@RequiredArgsConstructor
public class StockResearchController {

    private final StockResearchService service;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockResearchResponse> upload(
            @RequestPart("data") String data,
            @RequestPart("pdf") MultipartFile pdf
    ) {
        try {
            StockResearchRequest request = objectMapper.readValue(data, StockResearchRequest.class);
            return ResponseEntity.ok(service.create(request, pdf));
        } catch (Exception e) {
            throw new BadRequestException("Invalid research upload data: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<StockResearchResponse>> getAllResearch() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/stock/{stockId}")
    public ResponseEntity<List<StockResearchResponse>> getResearchByStock(
            @PathVariable Long stockId
    ) {
        return ResponseEntity.ok(service.getByStock(stockId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResearch(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}