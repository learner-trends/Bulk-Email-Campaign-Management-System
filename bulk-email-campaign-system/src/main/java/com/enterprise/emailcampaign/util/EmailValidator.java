package com.enterprise.emailcampaign.util;

import java.util.regex.Pattern;

/**
 * Stateless utility for email address validation.
 */
public final class EmailValidator {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$"
    );

    private EmailValidator() {
        // Utility class — no instantiation
    }

    /**
     * Returns true if the provided email matches a valid RFC-compliant format.
     */
    public static boolean isValid(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    /**
     * Returns the normalised (trimmed, lowercased) email, or throws if invalid.
     */
    public static String normalise(String email) {
        if (!isValid(email)) {
            throw new IllegalArgumentException("Invalid email address: " + email);
        }
        return email.trim().toLowerCase();
    }
}
