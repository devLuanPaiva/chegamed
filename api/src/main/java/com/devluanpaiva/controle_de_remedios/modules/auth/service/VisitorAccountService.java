package com.devluanpaiva.controle_de_remedios.modules.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Creates the lightweight account used by someone who signed in with Google or
 * Apple without being registered yet, so they can browse the app and ask to be
 * registered as a patient instead of being blocked at the sign-in screen.
 */
@Service
@RequiredArgsConstructor
public class VisitorAccountService {
    private static final int MAX_NAME_LENGTH = 120;
    private static final int MAX_IMAGE_URL_LENGTH = 255;
    private static final String FALLBACK_NAME = "Visitante";

    private final UserRepository userRepository;

    @Transactional
    public User findOrCreateByEmail(String email, String name, String imageUrl) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> createVisitor(email, name, imageUrl));
    }

    private User createVisitor(String email, String name, String imageUrl) {
        User visitor = User.builder()
                .name(resolveName(name, email))
                .email(email)
                .imageUrl(resolveImageUrl(imageUrl))
                .role(UserRole.VISITOR)
                .active(true)
                .build();

        return userRepository.save(visitor);
    }

    private String resolveName(String name, String email) {
        if (name != null && !name.isBlank()) {
            return truncate(name.trim());
        }

        String emailPrefix = email.split("@")[0];
        return emailPrefix.isBlank() ? FALLBACK_NAME : truncate(emailPrefix);
    }

    private String resolveImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.length() > MAX_IMAGE_URL_LENGTH) {
            return null;
        }

        return imageUrl;
    }

    private String truncate(String value) {
        return value.length() <= MAX_NAME_LENGTH ? value : value.substring(0, MAX_NAME_LENGTH);
    }
}
