package com.devluanpaiva.controle_de_remedios.modules.delivery.policy;

import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DeliveryAuthorizationPolicy {
    private static final Set<UserRole> PHARMACY_STAFF_ROLES = Set.of(UserRole.MANAGER, UserRole.ASSISTANT);
    private static final Set<UserRole> FULFILLER_ROLES = Set.of(
            UserRole.MANAGER, UserRole.ASSISTANT, UserRole.DELIVERER);

    private final AuthorizationPolicy authorizationPolicy;
    private final CompanyRepository companyRepository;

    public void requireStaffOf(User actor, Patient patient) {
        requireStaffOfCompany(actor, patient.getCompany().getId());
    }

    public void requireStaffOfCompany(User actor, UUID companyId) {
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, PHARMACY_STAFF_ROLES, () -> isMemberOf(companyId, actor));
    }

    public void requireFulfillerOf(User actor, Patient patient) {
        UUID companyId = patient.getCompany().getId();

        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, FULFILLER_ROLES, () -> isMemberOf(companyId, actor));
    }

    public void requireViewerOf(User actor, Patient patient) {
        boolean isSelf = actor.getRole() == UserRole.PATIENT
                && patient.getUser() != null
                && patient.getUser().getId().equals(actor.getId());

        authorizationPolicy.requireAdminOrCondition(
                actor, () -> isSelf || isMemberOf(patient.getCompany().getId(), actor));
    }

    public void requireRole(User actor, UserRole role) {
        authorizationPolicy.requireCondition(actor.getRole() == role);
    }

    public boolean isMemberOf(UUID companyId, User user) {
        return companyRepository.existsByIdAndUsers_Id(companyId, user.getId());
    }
}
