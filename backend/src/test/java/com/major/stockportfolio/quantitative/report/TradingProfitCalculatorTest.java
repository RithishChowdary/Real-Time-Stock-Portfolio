package com.major.stockportfolio.quantitative.report;

import java.time.Instant;
import java.util.List;

import com.major.stockportfolio.quantitative.engine.AccountSnapshot;
import com.major.stockportfolio.quantitative.engine.BacktestResult;
import org.junit.jupiter.api.Test;
import org.ta4j.core.BaseTradingRecord;
import org.ta4j.core.num.DoubleNum;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TradingProfitCalculatorTest {

    @Test
    void calculatesAccountEarningsFromFinalEquityWithoutAddingOpenPnlAgain() {
        AccountSnapshot finalSnapshot = new AccountSnapshot(
                3,
                Instant.parse("2025-01-04T00:00:00Z"),
                100.0,
                8L,
                900.0,
                0.0,
                -100.0,
                800.0,
                900.0
        );
        BaseTradingRecord tradingRecord = new BaseTradingRecord();
        tradingRecord.enter(2, DoubleNum.valueOf(112.5), DoubleNum.valueOf(8));
        BacktestResult result = new BacktestResult(
                tradingRecord,
                List.of(finalSnapshot)
        );

        assertEquals(
                -100.0,
                new TradingProfitCalculator().calculate(result, 1000.0),
                1e-8
        );
    }
}
