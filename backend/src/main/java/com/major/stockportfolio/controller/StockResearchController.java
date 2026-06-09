package com.major.stockportfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.major.stockportfolio.dto.StockResearchRequest;
import com.major.stockportfolio.interfaces.StockResearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/research")
@RequiredArgsConstructor
public class StockResearchController {

    private final StockResearchService service;

    private final ObjectMapper objectMapper;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> upload(

            @RequestPart("data")
            String data,

            @RequestPart("pdf")
            MultipartFile pdf

    ) throws Exception {

        StockResearchRequest request =
                objectMapper.readValue(
                        data,
                        StockResearchRequest.class
                );

        return ResponseEntity.ok(
                service.create(request, pdf)
        );
    }

    @GetMapping("/stock/{stockId}")
    public ResponseEntity<?> getResearch(
            @PathVariable Long stockId
    ) {

        return ResponseEntity.ok(
                service.getByStock(stockId)
        );
    }
}