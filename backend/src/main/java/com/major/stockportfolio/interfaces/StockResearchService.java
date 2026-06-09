package com.major.stockportfolio.interfaces;

import com.major.stockportfolio.dto.StockResearchRequest;
import com.major.stockportfolio.dto.StockResearchResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StockResearchService {

    StockResearchResponse create(
            StockResearchRequest request,
            MultipartFile pdf);

    List<StockResearchResponse>
    getByStock(Long stockId);
}