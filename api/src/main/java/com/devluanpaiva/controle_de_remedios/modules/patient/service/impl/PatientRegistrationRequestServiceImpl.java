package com.devluanpaiva.controle_de_remedios.modules.patient.service.impl;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.EmailService;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientRegistrationRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientRegistrationRequestResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PublicCompanySummaryDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.PatientRegistrationRequest;
import com.devluanpaiva.controle_de_remedios.modules.patient.enums.PatientRegistrationRequestStatus;
import com.devluanpaiva.controle_de_remedios.modules.patient.mapper.PatientMapper;
import com.devluanpaiva.controle_de_remedios.modules.patient.mapper.PatientRegistrationRequestMapper;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRegistrationRequestRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.service.PatientRegistrationRequestService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;
import com.devluanpaiva.controle_de_remedios.shared.utils.AppLinkBuilder;
import com.devluanpaiva.controle_de_remedios.shared.utils.BusinessHoursValidator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientRegistrationRequestServiceImpl implements PatientRegistrationRequestService {
    private final PatientRegistrationRequestRepository patientRegistrationRequestRepository;
    private final PatientRepository patientRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PatientMapper patientMapper;
    private final PatientRegistrationRequestMapper patientRegistrationRequestMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Value("${app.frontend.web-url}")
    private String webUrl;

    @Override
    @Transactional(readOnly = true)
    public PublicCompanySummaryDTO getPublicCompany(String slug) {
        Company company = findActiveCompanyBySlugOrThrow(slug);
        return new PublicCompanySummaryDTO(company.getId(), company.getName(), company.getImageUrl());
    }

    @Override
    @Transactional
    public void createRegistrationRequest(String slug, CreatePatientRegistrationRequestDTO dto) {
        Company company = findActiveCompanyBySlugOrThrow(slug);

        if (!BusinessHoursValidator.isWithinBusinessHours()) {
            throw new BusinessException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Fora do horário de atendimento",
                    "OUTSIDE_BUSINESS_HOURS",
                    "createdAt",
                    "O cadastro só pode ser enviado de segunda a sexta, das 8h às 17h.");
        }

        if (patientRegistrationRequestRepository.existsByCompanyIdAndCpfAndStatus(
                company.getId(), dto.cpf(), PatientRegistrationRequestStatus.PENDING)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "Solicitação já enviada",
                    "REGISTRATION_REQUEST_ALREADY_PENDING",
                    "cpf",
                    "Já existe uma solicitação de cadastro pendente para este CPF nesta empresa.");
        }

        if (userRepository.existsByEmail(dto.email())) {
            throw emailAlreadyExists(dto.email());
        }

        PatientRegistrationRequest request = PatientRegistrationRequest.builder()
                .company(company)
                .name(dto.name())
                .cpf(dto.cpf())
                .birthDate(dto.birthDate())
                .contact(dto.contact())
                .address(dto.address())
                .email(dto.email())
                .passwordHash(passwordEncoder.encode(dto.password()))
                .build();

        patientRegistrationRequestRepository.save(request);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientRegistrationRequestResponseDTO> getPendingRequests(Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT), () -> true);

        Page<PatientRegistrationRequest> page = actor.getRole() == UserRole.ADMIN
                ? patientRegistrationRequestRepository.findAllByStatus(
                        PatientRegistrationRequestStatus.PENDING, pageable)
                : patientRegistrationRequestRepository.findAllByCompanyIdInAndStatus(
                        companyIdsOf(actor), PatientRegistrationRequestStatus.PENDING, pageable);

        return page.map(patientRegistrationRequestMapper::toResponseDTO);
    }

    @Override
    @Transactional
    public PatientResponseDTO approveRequest(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        PatientRegistrationRequest request = findPendingRequestOrThrow(id);
        assertCanReview(actor, request);

        Patient patient = patientRepository.findByCompany_IdAndCpf(request.getCompany().getId(), request.getCpf())
                .map(existingPatient -> attachAccount(existingPatient, request))
                .orElseGet(() -> createPatientWithAccount(request));

        request.setStatus(PatientRegistrationRequestStatus.APPROVED);
        request.setReviewedBy(actor);
        request.setReviewedAt(LocalDateTime.now());
        patientRegistrationRequestRepository.save(request);

        sendApprovedEmail(patient.getUser());

        return patientMapper.toResponseDTO(patient);
    }

    @Override
    @Transactional
    public void rejectRequest(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        PatientRegistrationRequest request = findPendingRequestOrThrow(id);
        assertCanReview(actor, request);

        request.setStatus(PatientRegistrationRequestStatus.REJECTED);
        request.setReviewedBy(actor);
        request.setReviewedAt(LocalDateTime.now());
        patientRegistrationRequestRepository.save(request);
    }

    private Patient attachAccount(Patient patient, PatientRegistrationRequest request) {
        if (patient.getUser() != null) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "Paciente já possui conta",
                    "PATIENT_ACCOUNT_ALREADY_EXISTS",
                    "cpf",
                    "Este paciente já possui uma conta de usuário vinculada.");
        }

        User user = buildApprovedUser(patient.getName(), patient.getCpf(), request, patient.getCompany());
        User savedUser = userRepository.save(user);

        patient.setUser(savedUser);
        return patientRepository.save(patient);
    }

    private Patient createPatientWithAccount(PatientRegistrationRequest request) {
        User user = buildApprovedUser(request.getName(), request.getCpf(), request, request.getCompany());
        User savedUser = userRepository.save(user);

        Patient patient = Patient.builder()
                .name(request.getName())
                .cpf(request.getCpf())
                .birthdate(request.getBirthDate().atStartOfDay())
                .company(request.getCompany())
                .user(savedUser)
                .contact(request.getContact())
                .address(request.getAddress())
                .build();

        return patientRepository.save(patient);
    }

    private User buildApprovedUser(String name, String cpf, PatientRegistrationRequest request, Company company) {
        return userRepository.findByCpf(cpf)
                .map(existingUser -> reactivateUser(existingUser, name, request, company))
                .orElseGet(() -> createNewUser(name, cpf, request, company));
    }

    private User reactivateUser(User user, String name, PatientRegistrationRequest request, Company company) {
        if (user.getRole() != UserRole.PATIENT || patientRepository.existsByUser_Id(user.getId())) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "CPF já cadastrado",
                    "CPF_ALREADY_EXISTS",
                    "cpf",
                    "Já existe um usuário cadastrado com o CPF '" + user.getCpf() + "'.");
        }

        userRepository.findByEmail(request.getEmail())
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw emailAlreadyExists(request.getEmail());
                });

        user.setName(name);
        user.setEmail(request.getEmail());
        user.setPassword(request.getPasswordHash());
        user.setActive(true);
        user.assignToCompany(company);

        return user;
    }

    private User createNewUser(String name, String cpf, PatientRegistrationRequest request, Company company) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw emailAlreadyExists(request.getEmail());
        }

        User user = User.builder()
                .name(name)
                .email(request.getEmail())
                .cpf(cpf)
                .role(UserRole.PATIENT)
                .password(request.getPasswordHash())
                .active(true)
                .build();

        user.assignToCompany(company);
        return user;
    }

    private void sendApprovedEmail(User user) {
        try {
            emailService.sendPatientRegistrationApprovedEmail(user, AppLinkBuilder.build(webUrl, ""));
        } catch (RuntimeException ex) {
            log.error("Falha ao enviar e-mail de aprovação de cadastro para o usuário '{}'", user.getId(), ex);
        }
    }

    private void assertCanReview(User actor, PatientRegistrationRequest request) {
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                () -> companyRepository.existsByIdAndUsers_Id(request.getCompany().getId(), actor.getId()));
    }

    private Set<UUID> companyIdsOf(User actor) {
        return actor.getCompanies().stream()
                .map(Company::getId)
                .collect(Collectors.toSet());
    }

    private BusinessException emailAlreadyExists(String email) {
        return new BusinessException(
                HttpStatus.CONFLICT,
                "E-mail já cadastrado",
                "EMAIL_ALREADY_EXISTS",
                "email",
                "Já existe um usuário cadastrado com o e-mail '" + email + "'.");
    }

    private Company findActiveCompanyBySlugOrThrow(String slug) {
        return companyRepository.findBySlug(slug)
                .filter(Company::getActive)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Empresa não encontrada",
                        "COMPANY_NOT_FOUND",
                        "slug",
                        "Não foi possível encontrar uma empresa com o identificador '" + slug + "'."));
    }

    private PatientRegistrationRequest findPendingRequestOrThrow(UUID id) {
        PatientRegistrationRequest request = patientRegistrationRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Solicitação não encontrada",
                        "PATIENT_REGISTRATION_REQUEST_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar uma solicitação de cadastro com o ID '" + id + "'."));

        if (request.getStatus() != PatientRegistrationRequestStatus.PENDING) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "Solicitação já analisada",
                    "PATIENT_REGISTRATION_REQUEST_ALREADY_REVIEWED",
                    "id",
                    "Esta solicitação de cadastro já foi analisada.");
        }

        return request;
    }
}
