package com.enterprise.emailcampaign.security;

import com.enterprise.emailcampaign.model.entity.User;
import com.enterprise.emailcampaign.model.enums.Role;
import com.enterprise.emailcampaign.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        log.info("========= DataInitializer CREATED =========");
    }

    @PostConstruct
    public void init() {
        System.out.println("DataInitializer bean created");
    }

    @Override
    public void run(String... args) {

        log.info("========== DataInitializer STARTED ==========");

        long count = userRepository.count();

        log.info("========== USER COUNT : " + count + " ==========");

        if(count == 0){

            User admin = User.builder()
                    .name("Admin")
                    .email("admin@gmail.com")
                    .password(
                            passwordEncoder.encode("Admin@123")
                    )
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);

            log.info("========== ADMIN CREATED ==========");
        }
    }

}
