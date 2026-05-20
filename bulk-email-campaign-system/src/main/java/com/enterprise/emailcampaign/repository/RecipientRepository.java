package com.enterprise.emailcampaign.repository;

import com.enterprise.emailcampaign.model.entity.Recipient;
import com.enterprise.emailcampaign.model.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data access layer for Recipient entities.
 */
@Repository
public interface RecipientRepository extends JpaRepository<Recipient, Long> {

    Optional<Recipient> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Recipient> findBySubscriptionStatus(SubscriptionStatus status);

    List<Recipient> findAllByOrderByCreatedAtDesc();

    long countBySubscriptionStatus(SubscriptionStatus status);
}
