package com.enterprise.emailcampaign.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when CSV parsing fails due to format or content errors.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class CsvParseException extends RuntimeException {

    public CsvParseException(String message) {
        super(message);
    }

    public CsvParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
