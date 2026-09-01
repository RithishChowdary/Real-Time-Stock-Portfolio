package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.StockResearchRequest;
import com.major.stockportfolio.dto.StockResearchResponse;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.StockResearch;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.exception.ResourceNotFoundException;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.repository.StockResearchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockResearchServiceTest {

    @Mock
    private StockResearchRepository repository;

    @Mock
    private StockRepository stockRepository;

    private StockResearchServiceImpl service;
    private Stock testStock;

    @BeforeEach
    void setUp() {
        service = new StockResearchServiceImpl(repository, stockRepository);
        testStock = Stock.builder()
                .id(1L)
                .symbol("TCS")
                .companyName("Tata Consultancy Services")
                .build();
    }

    @Test
    void testGetAll_Success() {
        StockResearch r1 = StockResearch.builder()
                .id(10L)
                .title("TCS Q3 Report")
                .summary("Strong revenue growth")
                .pdfUrl("test.pdf")
                .createdAt(LocalDateTime.now())
                .stock(testStock)
                .build();

        when(repository.findAllOrderByCreatedAtDesc()).thenReturn(List.of(r1));

        List<StockResearchResponse> list = service.getAll();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("TCS Q3 Report", list.get(0).getTitle());
        assertEquals("TCS", list.get(0).getStockSymbol());
    }

    @Test
    void testGetByStock_Success() {
        StockResearch r1 = StockResearch.builder()
                .id(10L)
                .title("TCS Q3 Report")
                .summary("Strong revenue growth")
                .pdfUrl("test.pdf")
                .createdAt(LocalDateTime.now())
                .stock(testStock)
                .build();

        when(repository.findByStockIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(r1));

        List<StockResearchResponse> list = service.getByStock(1L);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("TCS", list.get(0).getStockSymbol());
    }

    @Test
    void testCreate_MissingTitleThrowsException() {
        StockResearchRequest req = StockResearchRequest.builder()
                .stockId(1L)
                .title("")
                .build();
        MockMultipartFile file = new MockMultipartFile("pdf", "test.pdf", "application/pdf", "dummy content".getBytes());

        assertThrows(BadRequestException.class, () -> service.create(req, file));
    }

    @Test
    void testCreate_MissingStockThrowsException() {
        StockResearchRequest req = StockResearchRequest.builder()
                .stockId(null)
                .title("Analysis")
                .build();
        MockMultipartFile file = new MockMultipartFile("pdf", "test.pdf", "application/pdf", "dummy content".getBytes());

        assertThrows(BadRequestException.class, () -> service.create(req, file));
    }

    @Test
    void testCreate_MissingPdfThrowsException() {
        StockResearchRequest req = StockResearchRequest.builder()
                .stockId(1L)
                .title("Analysis")
                .build();

        assertThrows(BadRequestException.class, () -> service.create(req, null));
    }

    @Test
    void testCreate_InvalidFileTypeThrowsException() {
        StockResearchRequest req = StockResearchRequest.builder()
                .stockId(1L)
                .title("Analysis")
                .build();
        MockMultipartFile file = new MockMultipartFile("pdf", "image.png", "image/png", "dummy content".getBytes());

        assertThrows(BadRequestException.class, () -> service.create(req, file));
    }

    @Test
    void testDelete_NotFoundThrowsException() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.delete(99L));
    }

    @Test
    void testDelete_Success() {
        StockResearch research = StockResearch.builder()
                .id(10L)
                .pdfUrl("non_existent_test_file.pdf")
                .build();

        when(repository.findById(10L)).thenReturn(Optional.of(research));

        service.delete(10L);

        verify(repository, times(1)).delete(research);
    }
}
