package com.enterprise.emailcampaign.controller;

import com.enterprise.emailcampaign.model.dto.request.CampaignRequest;
import com.enterprise.emailcampaign.model.dto.response.CampaignResponse;
import com.enterprise.emailcampaign.service.CampaignService;
import com.enterprise.emailcampaign.service.RecipientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MVC controller for the Thymeleaf-based admin UI.
 * Separate from REST controllers to maintain clean separation of concerns.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class WebController {

    private final CampaignService campaignService;
    private final RecipientService recipientService;

    // ── Dashboard ──────────────────────────────────────────────────────────────

    @GetMapping("/")
    public String dashboard(Model model) {
        List<CampaignResponse> campaigns = campaignService.getAllCampaigns();
        model.addAttribute("campaigns", campaigns);
        model.addAttribute("totalRecipients", recipientService.countTotal());
        model.addAttribute("subscribedCount", recipientService.countSubscribed());
        model.addAttribute("totalCampaigns", campaigns.size());
        return "dashboard";
    }

    // ── Campaigns ──────────────────────────────────────────────────────────────

    @GetMapping("/campaigns")
    public String listCampaigns(Model model) {
        model.addAttribute("campaigns", campaignService.getAllCampaigns());
        return "campaigns/list";
    }

    @GetMapping("/campaigns/new")
    public String newCampaignForm(Model model) {
        model.addAttribute("campaignRequest", new CampaignRequest());
        return "campaigns/form";
    }

    @PostMapping("/campaigns")
    public String createCampaign(
            @ModelAttribute("campaignRequest") CampaignRequest request,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            Model model) {

        if (bindingResult.hasErrors()) {
            return "campaigns/form";
        }

        try {
            campaignService.createCampaign(request);
            redirectAttributes.addFlashAttribute("successMessage", "Campaign created successfully!");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to create campaign: " + ex.getMessage());
        }
        return "redirect:/campaigns";
    }

    @GetMapping("/campaigns/{id}")
    public String viewCampaign(@PathVariable Long id, Model model) {
        model.addAttribute("campaign", campaignService.getCampaignById(id));
        model.addAttribute("deliveryLogs", campaignService.getDeliveryLogs(id));
        return "campaigns/detail";
    }

    @GetMapping("/campaigns/{id}/edit")
    public String editCampaignForm(@PathVariable Long id, Model model) {
        CampaignResponse campaign = campaignService.getCampaignById(id);
        CampaignRequest request = CampaignRequest.builder()
                .campaignName(campaign.getCampaignName())
                .subjectLine(campaign.getSubjectLine())
                .emailContent(campaign.getEmailContent())
                .scheduledTime(campaign.getScheduledTime())
                .build();
        model.addAttribute("campaignRequest", request);
        model.addAttribute("campaignId", id);
        return "campaigns/form";
    }

    @PostMapping("/campaigns/{id}/update")
    public String updateCampaign(
            @PathVariable Long id,
            @ModelAttribute("campaignRequest") CampaignRequest request,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {

        if (bindingResult.hasErrors()) {
            return "campaigns/form";
        }

        try {
            campaignService.updateCampaign(id, request);
            redirectAttributes.addFlashAttribute("successMessage", "Campaign updated successfully!");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorMessage", ex.getMessage());
        }
        return "redirect:/campaigns/" + id;
    }

    @PostMapping("/campaigns/{id}/schedule")
    public String scheduleCampaign(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            campaignService.scheduleCampaign(id);
            redirectAttributes.addFlashAttribute("successMessage", "Campaign scheduled successfully!");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorMessage", ex.getMessage());
        }
        return "redirect:/campaigns/" + id;
    }

    @PostMapping("/campaigns/{id}/execute")
    public String executeCampaign(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            campaignService.executeCampaign(id);
            redirectAttributes.addFlashAttribute("successMessage", "Campaign executed successfully!");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorMessage", ex.getMessage());
        }
        return "redirect:/campaigns/" + id;
    }

    @PostMapping("/campaigns/{id}/delete")
    public String deleteCampaign(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            campaignService.deleteCampaign(id);
            redirectAttributes.addFlashAttribute("successMessage", "Campaign deleted.");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorMessage", ex.getMessage());
        }
        return "redirect:/campaigns";
    }

    // ── Recipients ─────────────────────────────────────────────────────────────

    @GetMapping("/recipients")
    public String listRecipients(Model model) {
        model.addAttribute("recipients", recipientService.getAllRecipients());
        model.addAttribute("totalCount", recipientService.countTotal());
        model.addAttribute("subscribedCount", recipientService.countSubscribed());
        return "recipients/list";
    }

    @PostMapping("/recipients/upload")
    public String uploadCsv(
            @RequestParam("file") MultipartFile file,
            RedirectAttributes redirectAttributes) {
        try {
            var result = recipientService.uploadRecipientsFromCsv(file);
            redirectAttributes.addFlashAttribute("successMessage",
                    "Upload complete! " + result.getSummary());
            if (!result.getErrors().isEmpty()) {
                redirectAttributes.addFlashAttribute("warnings", result.getErrors());
            }
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorMessage", "Upload failed: " + ex.getMessage());
        }
        return "redirect:/recipients";
    }

    @PostMapping("/recipients/{id}/unsubscribe")
    public String unsubscribe(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            recipientService.unsubscribeRecipient(id);
            redirectAttributes.addFlashAttribute("successMessage", "Recipient unsubscribed.");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorMessage", ex.getMessage());
        }
        return "redirect:/recipients";
    }

    @PostMapping("/recipients/{id}/resubscribe")
    public String resubscribe(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            recipientService.resubscribeRecipient(id);
            redirectAttributes.addFlashAttribute("successMessage", "Recipient resubscribed.");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorMessage", ex.getMessage());
        }
        return "redirect:/recipients";
    }

    @PostMapping("/recipients/{id}/delete")
    public String deleteRecipient(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            recipientService.deleteRecipient(id);
            redirectAttributes.addFlashAttribute("successMessage", "Recipient deleted.");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("errorMessage", ex.getMessage());
        }
        return "redirect:/recipients";
    }
}
