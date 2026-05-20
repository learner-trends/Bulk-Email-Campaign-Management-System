package com.enterprise.emailcampaign.repository;

import com.enterprise.emailcampaign.model.entity.DeliveryLog;
import com.enterprise.emailcampaign.model.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access layer for DeliveryLog entities.
 */
@Repository
public interface DeliveryLogRepository extends JpaRepository<DeliveryLog, Long> {

    List<DeliveryLog> findByCampaignId(Long campaignId);

    List<DeliveryLog> findByCampaignIdAndStatus(Long campaignId, DeliveryStatus status);

    long countByCampaignIdAndStatus(Long campaignId, DeliveryStatus status);

    long countByCampaignId(Long campaignId);
}
