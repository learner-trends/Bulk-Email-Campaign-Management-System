package com.enterprise.emailcampaign.model.entity;

import com.enterprise.emailcampaign.model.enums.CampaignStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents an email marketing campaign.
 * Holds campaign metadata, content, scheduling, and status lifecycle.
 */
@Entity
@Table(name = "campaigns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "campaign_name", nullable = false, length = 255)
    private String campaignName;

    @Column(name = "subject_line", nullable = false, length = 500)
    private String subjectLine;

    @Column(name = "email_content", nullable = false, columnDefinition = "TEXT")
    private String emailContent;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private CampaignStatus status = CampaignStatus.DRAFT;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DeliveryLog> deliveryLogs = new ArrayList<>();

    // Convenience methods for dashboard stats
    public long getSentCount() {
        return deliveryLogs.stream()
                .filter(log -> log.getStatus() == com.enterprise.emailcampaign.model.enums.DeliveryStatus.SENT)
                .count();
    }

    public long getFailedCount() {
        return deliveryLogs.stream()
                .filter(log -> log.getStatus() == com.enterprise.emailcampaign.model.enums.DeliveryStatus.FAILED)
                .count();
    }

    public long getTotalCount() {
        return deliveryLogs.size();
    }
}
