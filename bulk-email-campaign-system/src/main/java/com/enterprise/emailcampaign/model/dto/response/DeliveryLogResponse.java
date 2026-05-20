package com.enterprise.emailcampaign.model.dto.response;

import com.enterprise.emailcampaign.model.enums.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Outbound DTO for delivery log entries.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryLogResponse {

    private Long id;
    private Long campaignId;
    private String recipientEmail;
    private String recipientName;
    private DeliveryStatus status;
    private String failureReason;
    private LocalDateTime sentAt;
}
