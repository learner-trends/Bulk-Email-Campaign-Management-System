package com.enterprise.emailcampaign.model.dto.response;

import com.enterprise.emailcampaign.model.enums.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Outbound DTO for recipient data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipientResponse {

    private Long id;
    private String name;
    private String email;
    private SubscriptionStatus subscriptionStatus;
    private LocalDateTime createdAt;
}
