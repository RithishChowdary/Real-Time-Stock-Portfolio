package com.major.stockportfolio.service;

import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.exception.UnsupportedSymbolException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final StockRepository stockRepository;

    private final StockService stockService;

    @Scheduled(fixedRate = 60000)
    public void refreshStockPrices() {

        List<Stock> stocks =
                stockRepository.findAll();

        log.info("Refreshing stock prices for {} stocks", stocks.size());

        for (Stock stock : stocks) {

            try {

                stockService.refreshAndSavePrice(
                        stock.getSymbol()
                );

                log.info(
                        "Updated stock: {}",
                        stock.getSymbol()
                );

            } catch (UnsupportedSymbolException ex) {
                log.info(
                        "Skipping unsupported stock symbol {}: {}",
                        stock.getSymbol(),
                        ex.getMessage()
                );
            } catch (Exception ex) {

                log.error(
                        "Failed to update stock: {}",
                        stock.getSymbol(),
                        ex
                );
            }
        }
    }
}