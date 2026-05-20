package com.enterprise.emailcampaign.repository;

import com.enterprise.emailcampaign.model.entity.Campaign;
import com.enterprise.emailcampaign.model.enums.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data access layer for Campaign entities.
 */
@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByStatus(CampaignStatus status);

    /**
     * Finds campaigns due for execution: SCHEDULED status with scheduled time at or before now.
     */
    @Query("SELECT c FROM Campaign c WHERE c.status = 'SCHEDULED' AND c.scheduledTime <= :now")
    List<Campaign> findScheduledCampaignsDue(LocalDateTime now);

    List<Campaign> findAllByOrderByCreatedAtDesc();
}
