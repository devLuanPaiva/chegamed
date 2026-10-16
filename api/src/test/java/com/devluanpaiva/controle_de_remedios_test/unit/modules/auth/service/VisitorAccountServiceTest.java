package com.devluanpaiva.controle_de_remedios_test.unit.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.devluanpaiva.controle_de_remedios.modules.auth.service.VisitorAccountService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("VisitorAccountService")
class VisitorAccountServiceTest {

    private static final String EMAIL = "stranger@example.com";
    private static final String AVATAR_URL = "https://example.com/avatar.png";

    @Mock
    private UserRepository userRepository;

    private VisitorAccountService visitorAccountService;

    @BeforeEach
    void setUp() {
        visitorAccountService = new VisitorAccountService(userRepository);
    }

    private User savedUser() {
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        return captor.getValue();
    }

    private void mockSaveReturningArgument() {
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("should return the existing user without creating a visitor when the e-mail is registered")
    void shouldReturnExistingUser() {
        User existing = User.builder()
                .id(UUID.randomUUID())
                .name("Luan Alves")
                .email(EMAIL)
                .role(UserRole.PATIENT)
                .active(true)
                .build();

        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(existing));

        User result = visitorAccountService.findOrCreateByEmail(EMAIL, "Ignored Name", AVATAR_URL);

        assertThat(result).isSameAs(existing);
        assertThat(result.getRole()).isEqualTo(UserRole.PATIENT);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("should create an active visitor without password or cpf when the e-mail is unknown")
    void shouldCreateVisitorWhenEmailIsUnknown() {
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.empty());
        mockSaveReturningArgument();

        User result = visitorAccountService.findOrCreateByEmail(EMAIL, "Luan Alves", AVATAR_URL);

        assertThat(result).isSameAs(savedUser());
        assertThat(result.getRole()).isEqualTo(UserRole.VISITOR);
        assertThat(result.getName()).isEqualTo("Luan Alves");
        assertThat(result.getEmail()).isEqualTo(EMAIL);
        assertThat(result.getImageUrl()).isEqualTo(AVATAR_URL);
        assertThat(result.getActive()).isTrue();
        assertThat(result.getPassword()).isNull();
        assertThat(result.getCpf()).isNull();
        assertThat(result.getCompanies()).isEmpty();
    }

    @Test
    @DisplayName("should fall back to the e-mail prefix when the provider does not share a name")
    void shouldFallBackToEmailPrefixWhenNameIsMissing() {
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.empty());
        mockSaveReturningArgument();

        User result = visitorAccountService.findOrCreateByEmail(EMAIL, "   ", null);

        assertThat(result.getName()).isEqualTo("stranger");
        assertThat(result.getImageUrl()).isNull();
    }

    @Test
    @DisplayName("should truncate names longer than the column length")
    void shouldTruncateLongNames() {
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.empty());
        mockSaveReturningArgument();

        User result = visitorAccountService.findOrCreateByEmail(EMAIL, "N".repeat(200), null);

        assertThat(result.getName()).hasSize(120);
    }

    @Test
    @DisplayName("should drop image urls that do not fit the column instead of failing the sign-in")
    void shouldDropOversizedImageUrls() {
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.empty());
        mockSaveReturningArgument();

        User result = visitorAccountService.findOrCreateByEmail(EMAIL, "Luan Alves", "https://e.com/" + "a".repeat(300));

        assertThat(result.getImageUrl()).isNull();
    }
}
