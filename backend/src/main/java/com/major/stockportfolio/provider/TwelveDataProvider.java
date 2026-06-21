package com.major.stockportfolio.provider;

import com.major.stockportfolio.interfaces.MarketDataProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
public class TwelveDataProvider implements MarketDataProvider {

    private final RestTemplate restTemplate;

    @Value("${twelvedata.api.key}")
    private String apiKey;

    @Value("${twelvedata.base.url}")
    private String baseUrl;

    public TwelveDataProvider(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Double getCurrentPrice(String symbol) {

        try {
            return fetchPriceFromApi(symbol + ":BSE");
        } catch (Exception e) {
            log.warn("BSE failed for {}", symbol);
        }

        try {
            return fetchPriceFromApi(symbol + ":NSE");
        } catch (Exception e) {
            log.warn("NSE failed for {}", symbol);
        }

        throw new RuntimeException(
                "Unable to fetch live price"
        );
    }

    private Double fetchPriceFromApi(
            String formattedSymbol
    ) {

        String url =
                baseUrl +
                        "/price?symbol=" +
                        formattedSymbol +
                        "&apikey=" +
                        apiKey;

        ResponseEntity<Map<String, Object>> responseEntity =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<>() {}
                );

        Map<String, Object> response =
                responseEntity.getBody();

        if (response == null) {
            throw new RuntimeException("Empty API response");
        }

        Object priceValue = response.get("price");

        if (priceValue == null) {
            throw new RuntimeException("Price not found");
        }

        return Double.parseDouble(
                priceValue.toString()
        );
    }
}