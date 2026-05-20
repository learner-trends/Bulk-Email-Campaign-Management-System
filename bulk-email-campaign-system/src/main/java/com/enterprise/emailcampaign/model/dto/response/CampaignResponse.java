package com.enterprise.emailcampaign.model.dto.response;

import com.enterprise.emailcampaign.model.enums.CampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Outbound DTO for campaign data with dashboard stats.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignResponse {

    private Long id;
    private String campaignName;
    private String subjectLine;
    private String emailContent;
    private LocalDateTime scheduledTime;
    private CampaignStatus status;
    private long totalRecipients;
    private long sentCount;
    private long failedCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
