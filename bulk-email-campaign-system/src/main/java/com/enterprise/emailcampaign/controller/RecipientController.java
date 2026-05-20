package com.enterprise.emailcampaign.controller;

import com.enterprise.emailcampaign.model.dto.response.ApiResponse;
import com.enterprise.emailcampaign.model.dto.response.CsvUploadResult;
import com.enterprise.emailcampaign.model.dto.response.RecipientResponse;
import com.enterprise.emailcampaign.service.RecipientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * REST controller for recipient management and CSV import.
 * Base path: /api/v1/recipients
 */
@RestController
@RequestMapping("/api/v1/recipients")
@RequiredArgsConstructor
@Slf4j
public class RecipientController {

    private final RecipientService recipientService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecipientResponse>>> getAllRecipients() {
        return ResponseEntity.ok(ApiResponse.success(recipientService.getAllRecipients()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipientResponse>> getRecipientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(recipientService.getRecipientById(id)));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<CsvUploadResult>> uploadCsv(
            @RequestParam("file") MultipartFile file) {
        log.info("CSV upload request received: filename={}, size={}", file.getOriginalFilename(), file.getSize());
        CsvUploadResult result = recipientService.uploadRecipientsFromCsv(file);
        return ResponseEntity.ok(ApiResponse.success("CSV upload complete", result));
    }

    @PatchMapping("/{id}/unsubscribe")
    public ResponseEntity<ApiResponse<RecipientResponse>> unsubscribe(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Recipient unsubscribed", recipientService.unsubscribeRecipient(id)));
    }

    @PatchMapping("/{id}/resubscribe")
    public ResponseEntity<ApiResponse<RecipientResponse>> resubscribe(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Recipient resubscribed", recipientService.resubscribeRecipient(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecipient(@PathVariable Long id) {
        recipientService.deleteRecipient(id);
        return ResponseEntity.ok(ApiResponse.success("Recipient deleted", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        Map<String, Long> stats = Map.of(
                "total", recipientService.countTotal(),
                "subscribed", recipientService.countSubscribed()
        );
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
