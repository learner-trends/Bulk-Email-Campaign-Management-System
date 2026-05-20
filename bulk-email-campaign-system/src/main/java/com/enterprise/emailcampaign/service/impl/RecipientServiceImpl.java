package com.enterprise.emailcampaign.service.impl;

import com.enterprise.emailcampaign.exception.CsvParseException;
import com.enterprise.emailcampaign.exception.ResourceNotFoundException;
import com.enterprise.emailcampaign.model.dto.response.CsvUploadResult;
import com.enterprise.emailcampaign.model.dto.response.RecipientResponse;
import com.enterprise.emailcampaign.model.entity.Recipient;
import com.enterprise.emailcampaign.model.enums.SubscriptionStatus;
import com.enterprise.emailcampaign.repository.RecipientRepository;
import com.enterprise.emailcampaign.service.RecipientService;
import com.enterprise.emailcampaign.util.CampaignMapper;
import com.enterprise.emailcampaign.util.EmailValidator;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Handles recipient CRUD operations and bulk CSV ingestion.
 * CSV format expected: name,email,subscription_status (header row included).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecipientServiceImpl implements RecipientService {

    private final RecipientRepository recipientRepository;
    private final CampaignMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<RecipientResponse> getAllRecipients() {
        return recipientRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(mapper::toRecipientResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RecipientResponse getRecipientById(Long id) {
        return recipientRepository.findById(id)
                .map(mapper::toRecipientResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient", id));
    }

    @Override
    @Transactional
    public CsvUploadResult uploadRecipientsFromCsv(MultipartFile file) {
        validateFile(file);

        List<String[]> rows = parseCsv(file);
        if (rows.isEmpty() || (rows.size() == 1 && isHeaderRow(rows.get(0)))) {
            throw new CsvParseException("CSV file is empty or contains only headers");
        }

        // Determine starting row (skip header if present)
        int startRow = isHeaderRow(rows.get(0)) ? 1 : 0;

        int totalRows = rows.size() - startRow;
        int importedCount = 0;
        int duplicateCount = 0;
        int invalidCount = 0;
        List<String> errors = new ArrayList<>();

        // Track emails within this upload to catch intra-file duplicates
        Set<String> seenInFile = new HashSet<>();

        for (int i = startRow; i < rows.size(); i++) {
            String[] row = rows.get(i);
            int lineNumber = i + 1;

            if (row.length < 2) {
                errors.add("Row " + lineNumber + ": insufficient columns (need at least name and email)");
                invalidCount++;
                continue;
            }

            String name = row[0].trim();
            String rawEmail = row[1].trim();

            // Validate name
            if (name.isBlank()) {
                errors.add("Row " + lineNumber + ": name is blank");
                invalidCount++;
                continue;
            }

            // Validate email format
            if (!EmailValidator.isValid(rawEmail)) {
                errors.add("Row " + lineNumber + ": invalid email format '" + rawEmail + "'");
                invalidCount++;
                continue;
            }

            String normalisedEmail = EmailValidator.normalise(rawEmail);

            // Check intra-file duplicate
            if (seenInFile.contains(normalisedEmail)) {
                errors.add("Row " + lineNumber + ": duplicate email in file '" + normalisedEmail + "'");
                duplicateCount++;
                continue;
            }
            seenInFile.add(normalisedEmail);

            // Check database duplicate
            if (recipientRepository.existsByEmail(normalisedEmail)) {
                log.debug("Skipping duplicate email: {}", normalisedEmail);
                duplicateCount++;
                continue;
            }

            // Parse subscription status (default to SUBSCRIBED)
            SubscriptionStatus status = SubscriptionStatus.SUBSCRIBED;
            if (row.length >= 3 && !row[2].isBlank()) {
                try {
                    status = SubscriptionStatus.valueOf(row[2].trim().toUpperCase());
                } catch (IllegalArgumentException ex) {
                    log.warn("Row {}: unknown subscription status '{}', defaulting to SUBSCRIBED", lineNumber, row[2]);
                }
            }

            Recipient recipient = Recipient.builder()
                    .name(name)
                    .email(normalisedEmail)
                    .subscriptionStatus(status)
                    .build();

            recipientRepository.save(recipient);
            importedCount++;
        }

        CsvUploadResult result = CsvUploadResult.builder()
                .totalRows(totalRows)
                .importedCount(importedCount)
                .skippedCount(duplicateCount + invalidCount)
                .duplicateCount(duplicateCount)
                .invalidCount(invalidCount)
                .errors(errors)
                .build();

        log.info("CSV upload complete: {}", result.getSummary());
        return result;
    }

    @Override
    @Transactional
    public RecipientResponse unsubscribeRecipient(Long id) {
        Recipient recipient = recipientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient", id));
        recipient.setSubscriptionStatus(SubscriptionStatus.UNSUBSCRIBED);
        return mapper.toRecipientResponse(recipientRepository.save(recipient));
    }

    @Override
    @Transactional
    public RecipientResponse resubscribeRecipient(Long id) {
        Recipient recipient = recipientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient", id));
        recipient.setSubscriptionStatus(SubscriptionStatus.SUBSCRIBED);
        return mapper.toRecipientResponse(recipientRepository.save(recipient));
    }

    @Override
    @Transactional
    public void deleteRecipient(Long id) {
        if (!recipientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recipient", id);
        }
        recipientRepository.deleteById(id);
    }

    @Override
    public long countSubscribed() {
        return recipientRepository.countBySubscriptionStatus(SubscriptionStatus.SUBSCRIBED);
    }

    @Override
    public long countTotal() {
        return recipientRepository.count();
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CsvParseException("No file provided or file is empty");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            throw new CsvParseException("Only CSV files are supported");
        }
    }

    private List<String[]> parseCsv(MultipartFile file) {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            return reader.readAll();
        } catch (IOException | CsvException ex) {
            throw new CsvParseException("Failed to parse CSV: " + ex.getMessage(), ex);
        }
    }

    private boolean isHeaderRow(String[] row) {
        if (row.length == 0) return false;
        String first = row[0].trim().toLowerCase();
        return first.equals("name") || first.equals("full_name") || first.equals("fullname");
    }
}
