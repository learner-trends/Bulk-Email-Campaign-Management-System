package com.enterprise.emailcampaign.service;

/**
 * Service contract for email delivery.
 * Abstracts SMTP transport to allow alternate implementations (e.g., mock, SES).
 */
public interface EmailService {

    /**
     * Sends a single email. Returns true on success, false on failure.
     *
     * @param to          recipient email address
     * @param subject     email subject line
     * @param htmlContent HTML body content
     * @param recipientName personalisation token for content
     * @return true if delivered, false if transport failed
     */
    boolean sendEmail(String to, String subject, String htmlContent, String recipientName);

    /**
     * Last transport-level failure message, if any.
     */
    String getLastFailureReason();
}
