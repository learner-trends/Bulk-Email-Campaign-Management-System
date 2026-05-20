package com.enterprise.emailcampaign.service.impl;

import com.enterprise.emailcampaign.exception.InvalidCampaignStateException;
import com.enterprise.emailcampaign.exception.ResourceNotFoundException;
import com.enterprise.emailcampaign.model.dto.request.CampaignRequest;
import com.enterprise.emailcampaign.model.dto.response.CampaignResponse;
import com.enterprise.emailcampaign.model.dto.response.DeliveryLogResponse;
import com.enterprise.emailcampaign.model.entity.Campaign;
import com.enterprise.emailcampaign.model.entity.DeliveryLog;
import com.enterprise.emailcampaign.model.entity.Recipient;
import com.enterprise.emailcampaign.model.enums.CampaignStatus;
import com.enterprise.emailcampaign.model.enums.DeliveryStatus;
import com.enterprise.emailcampaign.model.enums.SubscriptionStatus;
import com.enterprise.emailcampaign.repository.CampaignRepository;
import com.enterprise.emailcampaign.repository.DeliveryLogRepository;
import com.enterprise.emailcampaign.repository.RecipientRepository;
import com.enterprise.emailcampaign.service.CampaignService;
import com.enterprise.emailcampaign.service.EmailService;
import com.enterprise.emailcampaign.util.CampaignMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Core campaign lifecycle service.
 * Manages campaign state transitions and orchestrates bulk email delivery.
 *
 * State machine:
 *   DRAFT → SCHEDULED → IN_PROGRESS → COMPLETED / FAILED
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignServiceImpl implements CampaignService {

    private final CampaignRepository campaignRepository;
    private final RecipientRepository recipientRepository;
    private final DeliveryLogRepository deliveryLogRepository;
    private final EmailService emailService;
    private final CampaignMapper mapper;

    // ── CRUD Operations ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CampaignResponse createCampaign(CampaignRequest request) {
        Campaign campaign = Campaign.builder()
                .campaignName(request.getCampaignName())
                .subjectLine(request.getSubjectLine())
                .emailContent(request.getEmailContent())
                .scheduledTime(request.getScheduledTime())
                .status(CampaignStatus.DRAFT)
                .build();

        Campaign saved = campaignRepository.save(campaign);
        log.info("Campaign created: id={}, name='{}'", saved.getId(), saved.getCampaignName());
        return mapper.toCampaignResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CampaignResponse getCampaignById(Long id) {
        Campaign campaign = findCampaignOrThrow(id);
        return mapper.toCampaignResponse(campaign);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampaignResponse> getAllCampaigns() {
        return campaignRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(mapper::toCampaignResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CampaignResponse updateCampaign(Long id, CampaignRequest request) {
        Campaign campaign = findCampaignOrThrow(id);

        if (campaign.getStatus() == CampaignStatus.IN_PROGRESS
                || campaign.getStatus() == CampaignStatus.COMPLETED) {
            throw new InvalidCampaignStateException(
                    "Cannot edit a campaign in state: " + campaign.getStatus());
        }

        campaign.setCampaignName(request.getCampaignName());
        campaign.setSubjectLine(request.getSubjectLine());
        campaign.setEmailContent(request.getEmailContent());
        campaign.setScheduledTime(request.getScheduledTime());
        campaign.setStatus(CampaignStatus.DRAFT); // Reset to DRAFT on edit

        Campaign updated = campaignRepository.save(campaign);
        log.info("Campaign updated: id={}", updated.getId());
        return mapper.toCampaignResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCampaign(Long id) {
        Campaign campaign = findCampaignOrThrow(id);
        if (campaign.getStatus() == CampaignStatus.IN_PROGRESS) {
            throw new InvalidCampaignStateException("Cannot delete a campaign that is currently in progress");
        }
        campaignRepository.delete(campaign);
        log.info("Campaign deleted: id={}", id);
    }

    // ── State Transitions ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public CampaignResponse scheduleCampaign(Long id) {
        Campaign campaign = findCampaignOrThrow(id);

        if (campaign.getStatus() != CampaignStatus.DRAFT) {
            throw new InvalidCampaignStateException(
                    "Only DRAFT campaigns can be scheduled. Current status: " + campaign.getStatus());
        }

        campaign.setStatus(CampaignStatus.SCHEDULED);
        Campaign saved = campaignRepository.save(campaign);
        log.info("Campaign scheduled: id={}, at={}", id, campaign.getScheduledTime());
        return mapper.toCampaignResponse(saved);
    }

    // ── Campaign Execution ─────────────────────────────────────────────────────

    /**
     * Executes the campaign by sending emails to all subscribed recipients.
     * Transitions: SCHEDULED → IN_PROGRESS → COMPLETED (or FAILED if all fail).
     *
     * This method is intentionally synchronous to avoid partial-state issues;
     * in production, consider delegating to an async executor or message queue.
     */
    @Override
    @Transactional
    public void executeCampaign(Long id) {
        Campaign campaign = findCampaignOrThrow(id);

        if (campaign.getStatus() != CampaignStatus.SCHEDULED
                && campaign.getStatus() != CampaignStatus.DRAFT) {
            log.warn("Skipping execution for campaign {} — status is {}", id, campaign.getStatus());
            return;
        }

        List<Recipient> recipients = recipientRepository.findBySubscriptionStatus(SubscriptionStatus.SUBSCRIBED);

        if (recipients.isEmpty()) {
            log.warn("No subscribed recipients found for campaign id={}", id);
            campaign.setStatus(CampaignStatus.COMPLETED);
            campaignRepository.save(campaign);
            return;
        }

        // Transition to IN_PROGRESS
        campaign.setStatus(CampaignStatus.IN_PROGRESS);
        campaignRepository.save(campaign);

        log.info("Executing campaign id={} for {} recipients", id, recipients.size());

        long sentCount = 0;
        long failedCount = 0;

        for (Recipient recipient : recipients) {
            boolean sent = emailService.sendEmail(
                    recipient.getEmail(),
                    campaign.getSubjectLine(),
                    campaign.getEmailContent(),
                    recipient.getName()
            );

            DeliveryLog deliveryLog = DeliveryLog.builder()
                    .campaign(campaign)
                    .recipientEmail(recipient.getEmail())
                    .recipientName(recipient.getName())
                    .status(sent ? DeliveryStatus.SENT : DeliveryStatus.FAILED)
                    .failureReason(sent ? null : emailService.getLastFailureReason())
                    .build();

            deliveryLogRepository.save(deliveryLog);

            if (sent) sentCount++;
            else failedCount++;
        }

        // Transition to final state
        campaign.setStatus(CampaignStatus.COMPLETED);
        campaignRepository.save(campaign);

        log.info("Campaign id={} completed. Sent={}, Failed={}", id, sentCount, failedCount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryLogResponse> getDeliveryLogs(Long campaignId) {
        findCampaignOrThrow(campaignId); // Validate campaign exists
        return deliveryLogRepository.findByCampaignId(campaignId).stream()
                .map(mapper::toDeliveryLogResponse)
                .collect(Collectors.toList());
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private Campaign findCampaignOrThrow(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));
    }
}
