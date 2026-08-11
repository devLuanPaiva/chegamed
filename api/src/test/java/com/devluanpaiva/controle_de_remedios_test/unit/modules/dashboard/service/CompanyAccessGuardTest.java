package com.devluanpaiva.controle_de_remedios_test.unit.modules.dashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.service.CompanyAccessGuard;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("CompanyAccessGuard")
class CompanyAccessGuardTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private CompanyAccessGuard companyAccessGuard;

    @BeforeEach
    void setUp() {
        companyAccessGuard = new CompanyAccessGuard(companyRepository, securityContextHelper, new AuthorizationPolicy());
    }

    private User buildUser(UserRole role) {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Actor")
                .email("actor@example.com")
                .password("hashed")
                .cpf("52998224725")
                .role(role)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("should allow an admin without checking company membership")
    void shouldAllowAdminWithoutCheckingMembership() {
        UUID companyId = UUID.randomUUID();
        User admin = buildUser(UserRole.ADMIN);

        when(securityContextHelper.getCurrentUser()).thenReturn(admin);

        companyAccessGuard.assertCanView(companyId);

        verifyNoInteractions(companyRepository);
    }

    @Test
    @DisplayName("should allow a manager who belongs to the company")
    void shouldAllowManagerMemberOfCompany() {
        UUID companyId = UUID.randomUUID();
        User manager = buildUser(UserRole.MANAGER);

        when(securityContextHelper.getCurrentUser()).thenReturn(manager);
        when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(true);

        companyAccessGuard.assertCanView(companyId);
    }

    @Test
    @DisplayName("should allow an assistant who belongs to the company")
    void shouldAllowAssistantMemberOfCompany() {
        UUID companyId = UUID.randomUUID();
        User assistant = buildUser(UserRole.ASSISTANT);

        when(securityContextHelper.getCurrentUser()).thenReturn(assistant);
        when(companyRepository.existsByIdAndUsers_Id(companyId, assistant.getId())).thenReturn(true);

        companyAccessGuard.assertCanView(companyId);
    }

    @Test
    @DisplayName("should forbid a manager who does not belong to the company")
    void shouldForbidManagerNotMemberOfCompany() {
        UUID companyId = UUID.randomUUID();
        User manager = buildUser(UserRole.MANAGER);

        when(securityContextHelper.getCurrentUser()).thenReturn(manager);
        when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(false);

        assertThatThrownBy(() -> companyAccessGuard.assertCanView(companyId))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                });
    }

    @Test
    @DisplayName("should forbid roles that can never view company summaries, even if a member")
    void shouldForbidRoleWithoutViewPrivilege() {
        UUID companyId = UUID.randomUUID();
        User deliverer = buildUser(UserRole.DELIVERER);

        when(securityContextHelper.getCurrentUser()).thenReturn(deliverer);

        assertThatThrownBy(() -> companyAccessGuard.assertCanView(companyId))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                });

        verifyNoInteractions(companyRepository);
    }
}
