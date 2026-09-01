package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.StockResearchRequest;
import com.major.stockportfolio.dto.StockResearchResponse;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.StockResearch;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.exception.ResourceNotFoundException;
import com.major.stockportfolio.interfaces.StockResearchService;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.repository.StockResearchRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class StockResearchServiceImpl implements StockResearchService {

    private final StockResearchRepository repository;
    private final StockRepository stockRepository;

    @Value("${app.upload.research-dir:uploads/research}")
    private String researchUploadDir;

    public StockResearchServiceImpl(
            StockResearchRepository repository,
            StockRepository stockRepository) {

        this.repository = repository;
        this.stockRepository = stockRepository;
    }

    @Override
    public List<StockResearchResponse> getByStock(Long stockId) {
        return repository
                .findByStockIdOrderByCreatedAtDesc(stockId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<StockResearchResponse> getAll() {
        return repository
                .findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public StockResearchResponse create(
            StockResearchRequest request,
            MultipartFile pdf) {

        if (request == null) {
            throw new BadRequestException("Research request must not be null");
        }

        if (request.getStockId() == null) {
            throw new BadRequestException("Stock selection is required");
        }

        if (request.getTitle() == null || request.getTitle().trim().isBlank()) {
            throw new BadRequestException("Research title is required");
        }

        if (pdf == null || pdf.isEmpty()) {
            throw new BadRequestException("Research PDF document is required");
        }

        String contentType = pdf.getContentType();
        if (contentType != null && !contentType.equalsIgnoreCase("application/pdf") && !pdf.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF documents are supported for research reports");
        }

        try {
            String originalFileName = Path.of(
                    pdf.getOriginalFilename() == null ? "research.pdf" : pdf.getOriginalFilename()
            ).getFileName().toString();

            String fileName = UUID.randomUUID() + "_" + originalFileName;

            Path uploadRoot = Paths.get(researchUploadDir).toAbsolutePath().normalize();
            Path targetPath = uploadRoot.resolve(fileName).normalize();

            Files.createDirectories(targetPath.getParent());
            Files.copy(pdf.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Stock stock = stockRepository.findById(request.getStockId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stock not found with ID: " + request.getStockId()));

            StockResearch research = StockResearch.builder()
                    .title(request.getTitle().trim())
                    .summary(request.getSummary() != null ? request.getSummary().trim() : "")
                    .sourceUrl(request.getSourceUrl() != null ? request.getSourceUrl().trim() : "")
                    .pdfUrl(fileName)
                    .createdAt(LocalDateTime.now())
                    .stock(stock)
                    .build();

            StockResearch saved = repository.save(research);
            log.info("Research report uploaded successfully for stock: {}. ID: {}", stock.getSymbol(), saved.getId());

            return mapToResponse(saved);

        } catch (IOException e) {
            log.error("Failed to store research file", e);
            throw new BadRequestException("Failed to upload research document. Please check storage configuration.");
        }
    }

    @Override
    public void delete(Long id) {
        StockResearch research = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Research report not found with ID: " + id));

        try {
            if (research.getPdfUrl() != null && !research.getPdfUrl().isBlank()) {
                Path uploadRoot = Paths.get(researchUploadDir).toAbsolutePath().normalize();
                Path targetPath = uploadRoot.resolve(research.getPdfUrl()).normalize();
                Files.deleteIfExists(targetPath);
            }
        } catch (Exception e) {
            log.warn("Failed to delete physical research PDF file: {}", research.getPdfUrl(), e);
        }

        repository.delete(research);
        log.info("Research report deleted successfully. ID: {}", id);
    }

    private StockResearchResponse mapToResponse(StockResearch research) {
        return StockResearchResponse.builder()
                .id(research.getId())
                .title(research.getTitle())
                .summary(research.getSummary())
                .pdfUrl(research.getPdfUrl())
                .sourceUrl(research.getSourceUrl())
                .createdAt(research.getCreatedAt())
                .stockSymbol(research.getStock() != null ? research.getStock().getSymbol() : "")
                .build();
    }
}
