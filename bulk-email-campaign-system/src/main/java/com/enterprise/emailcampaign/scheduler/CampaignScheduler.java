package com.enterprise.emailcampaign.scheduler;

import com.enterprise.emailcampaign.model.entity.Campaign;
import com.enterprise.emailcampaign.repository.CampaignRepository;
import com.enterprise.emailcampaign.service.CampaignService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Polls for campaigns whose scheduled time has arrived and triggers execution.
 * Runs every 60 seconds. In a clustered environment, add a distributed lock
 * (e.g. ShedLock) to prevent duplicate execution across nodes.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CampaignScheduler {

    private final CampaignRepository campaignRepository;
    private final CampaignService campaignService;

    @Scheduled(fixedDelay = 60_000) // Every 60 seconds
    public void processDueCampaigns() {
        LocalDateTime now = LocalDateTime.now();
        List<Campaign> dueCampaigns = campaignRepository.findScheduledCampaignsDue(now);

        if (dueCampaigns.isEmpty()) {
            log.debug("Scheduler tick: no campaigns due at {}", now);
            return;
        }

        log.info("Scheduler found {} campaign(s) due for execution", dueCampaigns.size());

        for (Campaign campaign : dueCampaigns) {
            try {
                log.info("Triggering execution for campaign id={} '{}'",
                        campaign.getId(), campaign.getCampaignName());
                campaignService.executeCampaign(campaign.getId());
            } catch (Exception ex) {
                log.error("Failed to execute campaign id={}: {}", campaign.getId(), ex.getMessage(), ex);
            }
        }
    }
}
