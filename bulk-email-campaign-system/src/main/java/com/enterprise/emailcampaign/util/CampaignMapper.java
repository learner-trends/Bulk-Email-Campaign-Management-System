package com.enterprise.emailcampaign.util;

import com.enterprise.emailcampaign.model.dto.response.CampaignResponse;
import com.enterprise.emailcampaign.model.dto.response.DeliveryLogResponse;
import com.enterprise.emailcampaign.model.dto.response.RecipientResponse;
import com.enterprise.emailcampaign.model.entity.Campaign;
import com.enterprise.emailcampaign.model.entity.DeliveryLog;
import com.enterprise.emailcampaign.model.entity.Recipient;
import com.enterprise.emailcampaign.repository.DeliveryLogRepository;
import com.enterprise.emailcampaign.model.enums.DeliveryStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Converts JPA entities to outbound DTOs.
 * Centralises mapping logic to keep services clean.
 */
@Component
@RequiredArgsConstructor
public class CampaignMapper {

    private final DeliveryLogRepository deliveryLogRepository;

    public CampaignResponse toCampaignResponse(Campaign campaign) {
        long sentCount = deliveryLogRepository.countByCampaignIdAndStatus(campaign.getId(), DeliveryStatus.SENT);
        long failedCount = deliveryLogRepository.countByCampaignIdAndStatus(campaign.getId(), DeliveryStatus.FAILED);
        long total = deliveryLogRepository.countByCampaignId(campaign.getId());

        return CampaignResponse.builder()
                .id(campaign.getId())
                .campaignName(campaign.getCampaignName())
                .subjectLine(campaign.getSubjectLine())
                .emailContent(campaign.getEmailContent())
                .scheduledTime(campaign.getScheduledTime())
                .status(campaign.getStatus())
                .totalRecipients(total)
                .sentCount(sentCount)
                .failedCount(failedCount)
                .createdAt(campaign.getCreatedAt())
                .updatedAt(campaign.getUpdatedAt())
                .build();
    }

    public RecipientResponse toRecipientResponse(Recipient recipient) {
        return RecipientResponse.builder()
                .id(recipient.getId())
                .name(recipient.getName())
                .email(recipient.getEmail())
                .subscriptionStatus(recipient.getSubscriptionStatus())
                .createdAt(recipient.getCreatedAt())
                .build();
    }

    public DeliveryLogResponse toDeliveryLogResponse(DeliveryLog log) {
        return DeliveryLogResponse.builder()
                .id(log.getId())
                .campaignId(log.getCampaign().getId())
                .recipientEmail(log.getRecipientEmail())
                .recipientName(log.getRecipientName())
                .status(log.getStatus())
                .failureReason(log.getFailureReason())
                .sentAt(log.getSentAt())
                .build();
    }
}
