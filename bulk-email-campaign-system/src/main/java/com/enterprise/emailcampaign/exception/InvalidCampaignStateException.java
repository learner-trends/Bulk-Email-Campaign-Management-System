package com.enterprise.emailcampaign.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a campaign operation is invalid for its current state.
 * Example: trying to schedule a campaign that is already IN_PROGRESS.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidCampaignStateException extends RuntimeException {

    public InvalidCampaignStateException(String message) {
        super(message);
    }
}
