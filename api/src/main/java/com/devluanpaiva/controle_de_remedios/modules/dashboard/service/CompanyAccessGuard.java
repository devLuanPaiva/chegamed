package com.devluanpaiva.controle_de_remedios.modules.dashboard.service;

import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CompanyAccessGuard {
    private static final Set<UserRole> VIEWER_ROLES = Set.of(UserRole.MANAGER, UserRole.ASSISTANT);

    private final CompanyRepository companyRepository;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    public void assertCanView(UUID companyId) {
        User actor = securityContextHelper.getCurrentUser();

        authorizationPolicy.requireAdminOrRolesWithCondition(actor, VIEWER_ROLES, () -> isMemberOf(companyId, actor));
    }

    private boolean isMemberOf(UUID companyId, User user) {
        return companyRepository.existsByIdAndUsers_Id(companyId, user.getId());
    }
}
