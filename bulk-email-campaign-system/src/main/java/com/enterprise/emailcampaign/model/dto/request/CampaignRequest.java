package com.enterprise.emailcampaign.model.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

/**
 * Inbound DTO for creating or updating a campaign.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignRequest {

    @NotBlank(message = "Campaign name is required")
    @Size(max = 255, message = "Campaign name must not exceed 255 characters")
    private String campaignName;

    @NotBlank(message = "Subject line is required")
    @Size(max = 500, message = "Subject line must not exceed 500 characters")
    private String subjectLine;

    @NotBlank(message = "Email content is required")
    private String emailContent;

    @NotNull(message = "Scheduled time is required")
    @Future(message = "Scheduled time must be in the future")

    private LocalDateTime scheduledTime;
}
