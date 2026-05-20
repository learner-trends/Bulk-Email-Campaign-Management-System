package com.enterprise.emailcampaign.service;

import com.enterprise.emailcampaign.model.dto.request.CampaignRequest;
import com.enterprise.emailcampaign.model.dto.response.CampaignResponse;
import com.enterprise.emailcampaign.model.dto.response.DeliveryLogResponse;

import java.util.List;

/**
 * Service contract for campaign lifecycle management.
 */
public interface CampaignService {

    CampaignResponse createCampaign(CampaignRequest request);

    CampaignResponse getCampaignById(Long id);

    List<CampaignResponse> getAllCampaigns();

    CampaignResponse updateCampaign(Long id, CampaignRequest request);

    void deleteCampaign(Long id);

    CampaignResponse scheduleCampaign(Long id);

    /**
     * Triggers immediate execution of a campaign regardless of scheduled time.
     */
    void executeCampaign(Long id);

    List<DeliveryLogResponse> getDeliveryLogs(Long campaignId);
}
