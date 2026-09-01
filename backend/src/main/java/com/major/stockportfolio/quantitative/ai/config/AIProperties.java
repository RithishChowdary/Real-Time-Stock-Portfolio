package com.major.stockportfolio.quantitative.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai")
public class AIProperties {

    private String provider = "gemini";
    private Gemini gemini = new Gemini();

    @Data
    public static class Gemini {
        private String apiKey;
        private String model = "gemini-1.5-flash";
        private String baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/";
    }
}
