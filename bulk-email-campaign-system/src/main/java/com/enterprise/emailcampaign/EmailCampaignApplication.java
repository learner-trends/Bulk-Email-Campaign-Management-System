package com.enterprise.emailcampaign;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point for the Bulk Email Campaign Management System.
 *
 * Architecture overview:
 *  - REST API:   /api/v1/** — JSON endpoints for programmatic access
 *  - Web UI:     /          — Thymeleaf admin dashboard
 *  - Scheduler:  Polls every 60s for campaigns due for execution
 */
@SpringBootApplication(scanBasePackages = "com.enterprise.emailcampaign")
@EnableScheduling
public class EmailCampaignApplication {

    public static void main(String[] args) {
        // Ensure the SQLite data directory exists before Hibernate initialises
//        new java.io.File("data").mkdirs();
        SpringApplication.run(EmailCampaignApplication.class, args);
    }
}
