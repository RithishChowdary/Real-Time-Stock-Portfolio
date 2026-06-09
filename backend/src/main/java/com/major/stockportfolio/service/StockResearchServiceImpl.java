package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.StockResearchRequest;
import com.major.stockportfolio.dto.StockResearchResponse;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.StockResearch;
import com.major.stockportfolio.interfaces.StockResearchService;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.repository.StockResearchRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class StockResearchServiceImpl implements StockResearchService {

    private final StockResearchRepository repository;
    private final StockRepository stockRepository;

    private static final String UPLOAD_DIR =
            "uploads/research/";

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
                .map(research ->
                        StockResearchResponse.builder()
                                .id(research.getId())
                                .title(research.getTitle())
                                .summary(research.getSummary())
                                .pdfUrl(research.getPdfUrl())
                                .sourceUrl(research.getSourceUrl())
                                .createdAt(research.getCreatedAt())
                                .stockSymbol(
                                        research.getStock()
                                                .getSymbol())
                                .build()
                )
                .toList();
    }

    @Override
    public StockResearchResponse create(
            StockResearchRequest request,
            MultipartFile pdf) {

        try {

            System.out.println(
                    "========== RESEARCH UPLOAD START ==========");

            System.out.println(
                    "Stock ID Received = "
                            + request.getStockId());

            System.out.println(
                    "Title = "
                            + request.getTitle());

            System.out.println(
                    "PDF Name = "
                            + pdf.getOriginalFilename());

            String fileName =
                    UUID.randomUUID()
                            + "_"
                            + pdf.getOriginalFilename();

            Path path =
                    Paths.get(
                            UPLOAD_DIR + fileName);

            Files.createDirectories(
                    path.getParent());

            Files.copy(
                    pdf.getInputStream(),
                    path,
                    StandardCopyOption.REPLACE_EXISTING
            );

            System.out.println(
                    "PDF Saved Successfully");

            System.out.println(
                    "Saved Path = "
                            + path.toAbsolutePath());

            Stock stock =
                    stockRepository.findById(
                                    request.getStockId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Stock not found with ID: "
                                                    + request.getStockId()));

            System.out.println(
                    "Stock Found = "
                            + stock.getSymbol());

            StockResearch research =
                    StockResearch.builder()
                            .title(request.getTitle())
                            .summary(request.getSummary())
                            .sourceUrl(
                                    request.getSourceUrl())
                            .pdfUrl(fileName)
                            .createdAt(
                                    LocalDateTime.now())
                            .stock(stock)
                            .build();

            System.out.println(
                    "Saving Research...");

            repository.save(research);

            System.out.println(
                    "Research Saved Successfully");

            System.out.println(
                    "Research ID = "
                            + research.getId());

            System.out.println(
                    "========== RESEARCH UPLOAD END ==========");

            return StockResearchResponse.builder()
                    .id(research.getId())
                    .title(research.getTitle())
                    .summary(research.getSummary())
                    .pdfUrl(research.getPdfUrl())
                    .sourceUrl(research.getSourceUrl())
                    .createdAt(research.getCreatedAt())
                    .stockSymbol(
                            stock.getSymbol())
                    .build();

        } catch (Exception e) {

            System.out.println(
                    "========== ERROR ==========");

            e.printStackTrace();

            throw new RuntimeException(
                    e.getMessage(),
                    e
            );
        }
    }
}