package com.major.stockportfolio.quantitative.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.quantitative.ai.config.AIProperties;
import com.major.stockportfolio.quantitative.ai.contracts.AIAnalysisProvider;
import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisRequest;
import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAIResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskMetrics;
import com.major.stockportfolio.quantitative.risk.dto.PositionExposure;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GeminiAIProvider implements AIAnalysisProvider {

    private final AIProperties aiProperties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiAIProvider(AIProperties aiProperties, ObjectMapper objectMapper) {
        this.aiProperties = aiProperties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    @Override
    public AIAnalysisResponse analyze(AIAnalysisRequest request) {
        String apiKey = aiProperties.getGemini().getApiKey();

        if (apiKey == null || apiKey.trim().isBlank()) {
            throw new BadRequestException("AI provider API key is not configured. Please set the GEMINI_API_KEY environment variable.");
        }

        String prompt = buildPrompt(request);
        String model = aiProperties.getGemini().getModel();
        String baseUrl = aiProperties.getGemini().getBaseUrl();

        String endpointUrl = baseUrl + model + ":generateContent?key=" + apiKey.trim();

        try {
            Map<String, Object> requestBodyMap = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.2,
                            "responseMimeType", "application/json"
                    )
            );

            String requestJson = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpointUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() != 200) {
                log.error("Gemini API error. Status: {}, Body: {}", httpResponse.statusCode(), httpResponse.body());
                throw new BadRequestException("AI analysis service returned an error (HTTP " + httpResponse.statusCode() + "). Please verify configuration or quota.");
            }

            return parseGeminiResponse(httpResponse.body(), request);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("AI analysis request was interrupted.");
        } catch (IOException e) {
            log.error("Failed to connect to Gemini AI API", e);
            throw new BadRequestException("Unable to communicate with AI analysis service. Please check network connectivity.");
        }
    }

    @Override
    public PortfolioRiskAIResponse analyzePortfolioRisk(PortfolioRiskMetrics metrics) {
        String apiKey = aiProperties.getGemini().getApiKey();

        if (apiKey == null || apiKey.trim().isBlank()) {
            throw new BadRequestException("AI provider API key is not configured. Please set the GEMINI_API_KEY environment variable.");
        }

        String prompt = buildPortfolioRiskPrompt(metrics);
        String model = aiProperties.getGemini().getModel();
        String baseUrl = aiProperties.getGemini().getBaseUrl();

        String endpointUrl = baseUrl + model + ":generateContent?key=" + apiKey.trim();

        try {
            Map<String, Object> requestBodyMap = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.2,
                            "responseMimeType", "application/json"
                    )
            );

            String requestJson = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpointUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() != 200) {
                log.error("Gemini API error for portfolio risk. Status: {}, Body: {}", httpResponse.statusCode(), httpResponse.body());
                throw new BadRequestException("AI analysis service returned an error (HTTP " + httpResponse.statusCode() + "). Please verify configuration or quota.");
            }

            return parsePortfolioRiskResponse(httpResponse.body(), metrics);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("AI portfolio risk analysis request was interrupted.");
        } catch (IOException e) {
            log.error("Failed to connect to Gemini AI API for portfolio risk", e);
            throw new BadRequestException("Unable to communicate with AI analysis service. Please check network connectivity.");
        }
    }

    public String buildPrompt(AIAnalysisRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an institutional quantitative trading analyst. Analyze the following real quantitative backtest results computed by TA4J for Indian asset '")
                .append(request.getSymbol()).append("' using quantitative strategy '")
                .append(request.getStrategy()).append("'.\n\n");

        sb.append("AUTHORITATIVE FACTS & METRICS (computed from historical data):\n");
        sb.append("- Total Trades: ").append(request.getTotalTrades()).append("\n");
        sb.append("- Winning Trades: ").append(request.getWinningTrades()).append("\n");
        sb.append("- Losing Trades: ").append(request.getLosingTrades()).append("\n");
        sb.append("- Win Rate: ").append(request.getWinRate()).append("%\n");
        sb.append("- Total Earnings: ₹").append(request.getTotalEarnings()).append("\n");
        sb.append("- Total Profit: ₹").append(request.getTotalProfit()).append("\n");
        sb.append("- Total Loss: ₹").append(request.getTotalLoss()).append("\n");
        sb.append("- Average Profit per Trade: ₹").append(request.getAverageProfit()).append("\n");
        sb.append("- Maximum Drawdown: ").append(request.getMaximumDrawdown()).append("%\n");
        sb.append("- Profit Factor: ").append(Double.isInfinite(request.getProfitFactor()) ? "Infinity (no losing trades)" : request.getProfitFactor()).append("\n\n");

        sb.append("STRICT INSTRUCTIONS:\n");
        sb.append("1. The provided numbers are ground truth facts. Do NOT alter, estimate, recalculate, or invent metrics.\n");
        sb.append("2. Do NOT invent prices, dates, or market news not provided.\n");
        sb.append("3. If total trades is very low (e.g. <= 3), explicitly note the small statistical sample size.\n");
        sb.append("4. If total trades is 0, state that no trade entry signals were triggered under these strategy parameters.\n");
        sb.append("5. If profit factor is Infinite, clarify that this occurs mathematically because there were 0 losing trades.\n");
        sb.append("6. Return a valid JSON object matching this schema exactly:\n");
        sb.append("{\n");
        sb.append("  \"summary\": \"2-sentence executive summary of the performance\",\n");
        sb.append("  \"performanceAnalysis\": \"Detailed breakdown of earnings, win rate, and drawdown\",\n");
        sb.append("  \"strengths\": [\"strength 1\", \"strength 2\"],\n");
        sb.append("  \"weaknesses\": [\"weakness 1\", \"weakness 2\"],\n");
        sb.append("  \"riskObservations\": [\"risk observation 1\", \"risk observation 2\"],\n");
        sb.append("  \"marketBehavior\": \"Explanation of market conditions that suited or hindered the strategy\",\n");
        sb.append("  \"interpretation\": \"Key actionable takeaway for quantitative execution\"\n");
        sb.append("}\n");

        return sb.toString();
    }

    public String buildPortfolioRiskPrompt(PortfolioRiskMetrics metrics) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a professional quantitative portfolio risk analyst for InvestIND, an Indian stock paper-trading and portfolio analytics platform.\n");
        sb.append("Analyze the following AUTHORITATIVE portfolio risk metrics computed deterministically by the Java backend engine from live user holdings and account data.\n\n");

        sb.append("AUTHORITATIVE BACKEND METRICS (Ground Truth):\n");
        sb.append("- Total Portfolio Value: ₹").append(metrics.getTotalPortfolioValue()).append("\n");
        sb.append("- Available Cash: ₹").append(metrics.getAvailableCash()).append("\n");
        sb.append("- Holdings Value: ₹").append(metrics.getHoldingsValue()).append("\n");
        sb.append("- Total Investment: ₹").append(metrics.getTotalInvestment()).append("\n");
        sb.append("- Profit / Loss: ₹").append(metrics.getProfitLoss()).append("\n");
        sb.append("- Return Percentage: ").append(String.format("%.2f", metrics.getReturnPercentage())).append("%\n");
        sb.append("- Active Holdings Count: ").append(metrics.getNumberOfHoldings()).append("\n");
        sb.append("- Largest Holding: ").append(metrics.getLargestHoldingSymbol())
                .append(" (₹").append(metrics.getLargestHoldingValue())
                .append(", ").append(String.format("%.2f", metrics.getLargestHoldingPercentage())).append("% of portfolio)\n");
        sb.append("- Cash Allocation: ").append(String.format("%.2f", metrics.getCashAllocationPercentage())).append("%\n");
        sb.append("- Deterministic Risk Score: ").append(metrics.getRiskScore()).append(" / 100\n");
        sb.append("- Risk Level: ").append(metrics.getRiskLevel()).append("\n");

        if (metrics.getRiskFactors() != null && !metrics.getRiskFactors().isEmpty()) {
            sb.append("- Identified Java Risk Factors:\n");
            for (String factor : metrics.getRiskFactors()) {
                sb.append("  * ").append(factor).append("\n");
            }
        }

        if (metrics.getPositionExposures() != null && !metrics.getPositionExposures().isEmpty()) {
            sb.append("\nPOSITION EXPOSURES (Holdings Breakdown):\n");
            for (PositionExposure exp : metrics.getPositionExposures()) {
                sb.append("  * ").append(exp.getSymbol()).append(" (").append(exp.getCompanyName()).append("): ")
                        .append(exp.getQuantity()).append(" units | Average Buy Price: ₹").append(exp.getAveragePrice())
                        .append(" | Current Market Price: ₹").append(exp.getCurrentPrice())
                        .append(" | Invested Cost: ₹").append(exp.getInvestedValue())
                        .append(" | Current Market Value: ₹").append(exp.getCurrentValue())
                        .append(" | Portfolio Weight: ").append(String.format("%.2f", exp.getExposurePercentage())).append("%")
                        .append(" | Unrealized P&L: ₹").append(exp.getProfitLoss())
                        .append(" (").append(String.format("%.2f", exp.getReturnPercentage())).append("%)\n");
            }
        } else {
            sb.append("\nPOSITION EXPOSURES: None (100% Cash / Liquid Portfolio).\n");
        }

        sb.append("\nSTRICT FINANCIAL TERMINOLOGY & GROUNDING INSTRUCTIONS:\n");
        sb.append("1. The backend metrics above are AUTHORITATIVE GROUND TRUTH. Do NOT alter, recalculate, estimate, or invent numerical values.\n");
        sb.append("2. FINANCIAL TERMINOLOGY DEFINITIONS:\n");
        sb.append("   - Average Buy Price: Weighted average acquisition cost of remaining units.\n");
        sb.append("   - Current Market Price: Latest market price used for current position valuation.\n");
        sb.append("   - Market Value: Current valuation (Quantity * Current Market Price).\n");
        sb.append("   - Unrealized P&L: Current Market Value minus Remaining Invested Cost Basis.\n");
        sb.append("   - Realized P&L: P&L resulting from completed SELL transactions.\n");
        sb.append("   - Position Return: Percentage return of open position based on cost basis.\n");
        sb.append("   - Maximum Drawdown: Refers ONLY to peak-to-trough historical drop across equity curves.\n");
        sb.append("3. DO NOT describe current unrealized P&L as 'realized loss' or 'realized profit'.\n");
        sb.append("4. DO NOT describe current unrealized loss from cost basis as 'drawdown' unless historical peak-to-trough data exists.\n");
        sb.append("5. Do NOT invent stocks, trades, market news, or historical prices not provided.\n");
        sb.append("6. Do NOT invent sector classifications unless explicitly provided.\n");
        sb.append("7. If the portfolio has 0 active holdings or 100% cash, explain that there is zero equity volatility, but highlight inflation/cash-drag considerations.\n");
        sb.append("8. If single-stock concentration is high (>35%), highlight concentration risk.\n");
        sb.append("9. If cash allocation is very low (<10%), note the lack of liquidity buffer for downside risk.\n");
        sb.append("10. FRAME ALL RECOMMENDATIONS AS EDUCATIONAL AREAS TO REVIEW. Do NOT provide direct buy/sell financial advice.\n");
        sb.append("11. Return a valid JSON object matching this schema exactly:\n");
        sb.append("{\n");
        sb.append("  \"executiveSummary\": \"2-sentence executive summary of the overall portfolio risk state\",\n");
        sb.append("  \"riskAssessment\": \"Detailed explanation of the Java-calculated Risk Score and Risk Level\",\n");
        sb.append("  \"exposureAnalysis\": \"Breakdown of position exposures and cash buffer liquidity\",\n");
        sb.append("  \"concentrationAnalysis\": \"Evaluation of asset concentration vs multi-holding diversification\",\n");
        sb.append("  \"strengths\": [\"Identified strength 1\", \"Identified strength 2\"],\n");
        sb.append("  \"areasOfConcern\": [\"Identified risk/concern 1\", \"Identified risk/concern 2\"],\n");
        sb.append("  \"recommendedReviewAreas\": [\"Review area 1\", \"Review area 2\"]\n");
        sb.append("}\n");

        return sb.toString();
    }

    private AIAnalysisResponse parseGeminiResponse(String responseBody, AIAnalysisRequest request) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");

            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new BadRequestException("AI service returned empty response.");
            }

            JsonNode content = candidates.get(0).path("content");
            JsonNode parts = content.path("parts");

            if (!parts.isArray() || parts.isEmpty()) {
                throw new BadRequestException("AI service returned empty content parts.");
            }

            String text = parts.get(0).path("text").asText("");

            String cleanJson = stripMarkdownCodeBlocks(text);
            JsonNode parsedAnalysis = objectMapper.readTree(cleanJson);

            List<String> strengths = new ArrayList<>();
            if (parsedAnalysis.has("strengths") && parsedAnalysis.get("strengths").isArray()) {
                parsedAnalysis.get("strengths").forEach(node -> strengths.add(node.asText()));
            }

            List<String> weaknesses = new ArrayList<>();
            if (parsedAnalysis.has("weaknesses") && parsedAnalysis.get("weaknesses").isArray()) {
                parsedAnalysis.get("weaknesses").forEach(node -> weaknesses.add(node.asText()));
            }

            List<String> riskObservations = new ArrayList<>();
            if (parsedAnalysis.has("riskObservations") && parsedAnalysis.get("riskObservations").isArray()) {
                parsedAnalysis.get("riskObservations").forEach(node -> riskObservations.add(node.asText()));
            }

            return AIAnalysisResponse.builder()
                    .symbol(request.getSymbol())
                    .strategy(request.getStrategy())
                    .summary(parsedAnalysis.path("summary").asText("Analysis completed."))
                    .performanceAnalysis(parsedAnalysis.path("performanceAnalysis").asText(""))
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .riskObservations(riskObservations)
                    .marketBehavior(parsedAnalysis.path("marketBehavior").asText(""))
                    .interpretation(parsedAnalysis.path("interpretation").asText(""))
                    .generatedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Gemini AI response: {}", responseBody, e);
            throw new BadRequestException("Failed to parse AI quantitative response. " + e.getMessage());
        }
    }

    private PortfolioRiskAIResponse parsePortfolioRiskResponse(String responseBody, PortfolioRiskMetrics metrics) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");

            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new BadRequestException("AI service returned empty response.");
            }

            JsonNode content = candidates.get(0).path("content");
            JsonNode parts = content.path("parts");

            if (!parts.isArray() || parts.isEmpty()) {
                throw new BadRequestException("AI service returned empty content parts.");
            }

            String text = parts.get(0).path("text").asText("");

            String cleanJson = stripMarkdownCodeBlocks(text);
            JsonNode parsed = objectMapper.readTree(cleanJson);

            List<String> strengths = new ArrayList<>();
            if (parsed.has("strengths") && parsed.get("strengths").isArray()) {
                parsed.get("strengths").forEach(node -> strengths.add(node.asText()));
            }

            List<String> areasOfConcern = new ArrayList<>();
            if (parsed.has("areasOfConcern") && parsed.get("areasOfConcern").isArray()) {
                parsed.get("areasOfConcern").forEach(node -> areasOfConcern.add(node.asText()));
            }

            List<String> recommendedReviewAreas = new ArrayList<>();
            if (parsed.has("recommendedReviewAreas") && parsed.get("recommendedReviewAreas").isArray()) {
                parsed.get("recommendedReviewAreas").forEach(node -> recommendedReviewAreas.add(node.asText()));
            }

            return PortfolioRiskAIResponse.builder()
                    .executiveSummary(parsed.path("executiveSummary").asText("Portfolio risk analysis complete."))
                    .riskAssessment(parsed.path("riskAssessment").asText(""))
                    .exposureAnalysis(parsed.path("exposureAnalysis").asText(""))
                    .concentrationAnalysis(parsed.path("concentrationAnalysis").asText(""))
                    .strengths(strengths)
                    .areasOfConcern(areasOfConcern)
                    .recommendedReviewAreas(recommendedReviewAreas)
                    .educationalDisclaimer("Educational portfolio risk interpretation only. Grounded strictly in Java-calculated metrics. Not personalized financial advice.")
                    .generatedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Gemini portfolio risk response: {}", responseBody, e);
            throw new BadRequestException("Failed to parse AI portfolio risk response. " + e.getMessage());
        }
    }

    private String stripMarkdownCodeBlocks(String text) {
        String cleanJson = text.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.substring(7);
        } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.substring(3);
        }
        if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        }
        return cleanJson.trim();
    }
}
