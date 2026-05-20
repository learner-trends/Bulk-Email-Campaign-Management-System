package com.enterprise.emailcampaign.service;

import com.enterprise.emailcampaign.security.JwtService;
import com.enterprise.emailcampaign.model.dto.request.LoginRequest;
import com.enterprise.emailcampaign.model.dto.request.RegisterRequest;
import com.enterprise.emailcampaign.model.dto.response.LoginResponse;
import com.enterprise.emailcampaign.model.entity.User;
import com.enterprise.emailcampaign.model.enums.Role;
import com.enterprise.emailcampaign.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {

        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(
                request.getRole() != null
                        ? request.getRole()
                        : Role.USER
        );

        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid credentials"));

        boolean matches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if(!matches) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(token);
    }
}
