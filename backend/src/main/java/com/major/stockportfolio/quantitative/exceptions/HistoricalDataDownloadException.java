package com.major.stockportfolio.quantitative.exceptions;

public class HistoricalDataDownloadException extends RuntimeException {

    public HistoricalDataDownloadException(String message) {
        super(message);
    }

    public HistoricalDataDownloadException(String message, Throwable cause) {
        super(message, cause);
    }

}
