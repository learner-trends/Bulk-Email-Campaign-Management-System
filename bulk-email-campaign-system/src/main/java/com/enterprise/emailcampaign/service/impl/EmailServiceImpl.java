package com.enterprise.emailcampaign.service.impl;

import com.enterprise.emailcampaign.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * SMTP-backed email delivery implementation using Spring's JavaMailSender.
 * Personalises content by substituting the {{name}} placeholder before sending.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name:Campaign Manager}")
    private String fromName;

    // ThreadLocal so the last failure reason is per-thread-safe (concurrent sending)
    private final ThreadLocal<String> lastFailureReason = new ThreadLocal<>();

    @Override
    public boolean sendEmail(String to, String subject, String htmlContent, String recipientName) {
        lastFailureReason.remove();
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);

            // Personalise content: replace {{name}} placeholder
            String personalisedContent = htmlContent.replace("{{name}}", recipientName != null ? recipientName : "Subscriber");
            helper.setText(personalisedContent, true);

            mailSender.send(message);
            log.debug("Email sent successfully to: {}", to);
            return true;

        } catch (MailException ex) {
            String reason = "Mail transport error: " + ex.getMostSpecificCause().getMessage();
            lastFailureReason.set(reason);
            log.error("Failed to send email to {}: {}", to, reason);
            return false;
        } catch (MessagingException ex) {
            String reason = "Message construction error: " + ex.getMessage();
            lastFailureReason.set(reason);
            log.error("Failed to build email for {}: {}", to, reason);
            return false;
        } catch (Exception ex) {
            String reason = "Unexpected error: " + ex.getMessage();
            lastFailureReason.set(reason);
            log.error("Unexpected error sending email to {}: {}", to, ex.getMessage());
            return false;
        }
    }

    @Override
    public String getLastFailureReason() {
        return lastFailureReason.get();
    }
}
