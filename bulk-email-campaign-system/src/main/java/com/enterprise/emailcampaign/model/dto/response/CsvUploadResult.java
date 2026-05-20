package com.enterprise.emailcampaign.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result summary returned after a CSV bulk-upload operation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CsvUploadResult {

    private int totalRows;
    private int importedCount;
    private int skippedCount;
    private int duplicateCount;
    private int invalidCount;
    private List<String> errors;

    public String getSummary() {
        return String.format(
                "Total: %d | Imported: %d | Duplicates skipped: %d | Invalid: %d",
                totalRows, importedCount, duplicateCount, invalidCount
        );
    }
}
