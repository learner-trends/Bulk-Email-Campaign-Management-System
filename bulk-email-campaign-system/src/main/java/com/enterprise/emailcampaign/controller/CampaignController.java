package com.enterprise.emailcampaign.controller;

import com.enterprise.emailcampaign.model.dto.request.CampaignRequest;
import com.enterprise.emailcampaign.model.dto.response.ApiResponse;
import com.enterprise.emailcampaign.model.dto.response.CampaignResponse;
import com.enterprise.emailcampaign.model.dto.response.DeliveryLogResponse;
import com.enterprise.emailcampaign.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing campaign CRUD and lifecycle endpoints.
 * Base path: /api/v1/campaigns
 */
@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
@Slf4j
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CampaignResponse>> createCampaign(
            @Valid @RequestBody CampaignRequest request) {
        CampaignResponse response = campaignService.createCampaign(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Campaign created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CampaignResponse>>> getAllCampaigns() {
        return ResponseEntity.ok(ApiResponse.success(campaignService.getAllCampaigns()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CampaignResponse>> getCampaignById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.getCampaignById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CampaignResponse>> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Campaign updated", campaignService.updateCampaign(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.ok(ApiResponse.success("Campaign deleted", null));
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<CampaignResponse>> scheduleCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Campaign scheduled", campaignService.scheduleCampaign(id)));
    }

    @PostMapping("/{id}/execute")
    public ResponseEntity<ApiResponse<Void>> executeCampaign(@PathVariable Long id) {
        campaignService.executeCampaign(id);
        return ResponseEntity.ok(ApiResponse.success("Campaign execution triggered", null));
    }

    @GetMapping("/{id}/delivery-logs")
    public ResponseEntity<ApiResponse<List<DeliveryLogResponse>>> getDeliveryLogs(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.getDeliveryLogs(id)));
    }
}
