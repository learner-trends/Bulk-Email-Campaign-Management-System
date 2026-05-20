package com.enterprise.emailcampaign.service;

import com.enterprise.emailcampaign.model.dto.response.CsvUploadResult;
import com.enterprise.emailcampaign.model.dto.response.RecipientResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service contract for recipient management and CSV import.
 */
public interface RecipientService {

    List<RecipientResponse> getAllRecipients();

    RecipientResponse getRecipientById(Long id);

    CsvUploadResult uploadRecipientsFromCsv(MultipartFile file);

    RecipientResponse unsubscribeRecipient(Long id);

    RecipientResponse resubscribeRecipient(Long id);

    void deleteRecipient(Long id);

    long countSubscribed();

    long countTotal();
}
