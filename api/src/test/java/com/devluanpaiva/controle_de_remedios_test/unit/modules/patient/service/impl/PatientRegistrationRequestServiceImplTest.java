package com.devluanpaiva.controle_de_remedios_test.unit.modules.patient.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.EmailService;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreateVisitorRegistrationRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PublicCompanySummaryDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.VisitorRegistrationRequestResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.PatientRegistrationRequest;
import com.devluanpaiva.controle_de_remedios.modules.patient.enums.PatientRegistrationRequestStatus;
import com.devluanpaiva.controle_de_remedios.modules.patient.mapper.PatientMapper;
import com.devluanpaiva.controle_de_remedios.modules.patient.mapper.PatientRegistrationRequestMapper;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRegistrationRequestRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.service.impl.PatientRegistrationRequestServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;
import com.devluanpaiva.controle_de_remedios.shared.utils.BusinessHoursValidator;

@ExtendWith(MockitoExtension.class)
@DisplayName("PatientRegistrationRequestServiceImpl")
class PatientRegistrationRequestServiceImplTest {

    private static final String VISITOR_CPF = "12345678901";
    private static final LocalDate BIRTH_DATE = LocalDate.of(1990, 5, 20);

    @Mock
    private PatientRegistrationRequestRepository patientRegistrationRequestRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private PatientRegistrationRequestServiceImpl service;

    private MockedStatic<BusinessHoursValidator> businessHours;

    private Company company;
    private User visitor;

    @BeforeEach
    void setUp() {
        service = new PatientRegistrationRequestServiceImpl(
                patientRegistrationRequestRepository,
                patientRepository,
                companyRepository,
                userRepository,
                new PatientMapper(),
                new PatientRegistrationRequestMapper(),
                passwordEncoder,
                emailService,
                securityContextHelper,
                new AuthorizationPolicy());

        ReflectionTestUtils.setField(service, "webUrl", "https://chegamed.com.br");

        businessHours = mockStatic(BusinessHoursValidator.class);
        businessHours.when(BusinessHoursValidator::isWithinBusinessHours).thenReturn(true);

        company = Company.builder()
                .id(UUID.randomUUID())
                .name("Farmácia Central")
                .slug("farmacia-central")
                .cnpj("12345678000199")
                .imageUrl("https://example.com/logo.png")
                .active(true)
                .build();

        visitor = User.builder()
                .id(UUID.randomUUID())
                .name("Luan Alves")
                .email("luan@example.com")
                .role(UserRole.VISITOR)
                .active(true)
                .build();
    }

    @AfterEach
    void tearDown() {
        businessHours.close();
    }

    private CreateVisitorRegistrationRequestDTO validDto() {
        return new CreateVisitorRegistrationRequestDTO(
                company.getId(), "Luan Alves", VISITOR_CPF, BIRTH_DATE, "85999999999", "Rua A, 100");
    }

    private void mockSaveReturningArgument() {
        when(patientRegistrationRequestRepository.save(any(PatientRegistrationRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private PatientRegistrationRequest savedRequest() {
        ArgumentCaptor<PatientRegistrationRequest> captor =
                ArgumentCaptor.forClass(PatientRegistrationRequest.class);
        verify(patientRegistrationRequestRepository).save(captor.capture());
        return captor.getValue();
    }

    private void assertBusinessException(ThrowingCallable callable, HttpStatus status, String code) {
        assertThatThrownBy(callable)
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(status);
                    assertThat(businessException.getCode()).isEqualTo(code);
                });
    }

    @Nested
    @DisplayName("getCompaniesOpenForRegistration")
    class GetCompaniesOpenForRegistration {

        @Test
        @DisplayName("should list the active companies a visitor can register with")
        void shouldListActiveCompanies() {
            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);
            when(companyRepository.findAllByActiveTrueOrderByNameAsc()).thenReturn(List.of(company));

            List<PublicCompanySummaryDTO> result = service.getCompaniesOpenForRegistration();

            assertThat(result).containsExactly(
                    new PublicCompanySummaryDTO(company.getId(), "Farmácia Central", "https://example.com/logo.png"));
        }

        @Test
        @DisplayName("should deny access to users that are not visitors")
        void shouldDenyNonVisitors() {
            visitor.setRole(UserRole.PATIENT);
            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);

            assertBusinessException(
                    () -> service.getCompaniesOpenForRegistration(), HttpStatus.FORBIDDEN, "AUTH_FORBIDDEN");

            verify(companyRepository, never()).findAllByActiveTrueOrderByNameAsc();
        }
    }

    @Nested
    @DisplayName("createVisitorRegistrationRequest")
    class CreateVisitorRegistrationRequest {

        @Test
        @DisplayName("should save a pending request linked to the visitor account and its e-mail")
        void shouldSaveRequestLinkedToVisitor() {
            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findByCpf(VISITOR_CPF)).thenReturn(Optional.empty());
            mockSaveReturningArgument();

            VisitorRegistrationRequestResponseDTO response = service.createVisitorRegistrationRequest(validDto());

            PatientRegistrationRequest request = savedRequest();
            assertThat(request.getRequestedBy()).isSameAs(visitor);
            assertThat(request.getCompany()).isSameAs(company);
            assertThat(request.getEmail()).isEqualTo("luan@example.com");
            assertThat(request.getPasswordHash()).isNull();
            assertThat(request.getCpf()).isEqualTo(VISITOR_CPF);
            assertThat(request.getBirthDate()).isEqualTo(BIRTH_DATE);
            assertThat(request.getStatus()).isEqualTo(PatientRegistrationRequestStatus.PENDING);

            assertThat(response.companyName()).isEqualTo("Farmácia Central");
            assertThat(response.maskedCpf()).isEqualTo("123.***.***-**");
            assertThat(response.status()).isEqualTo(PatientRegistrationRequestStatus.PENDING);

            verify(passwordEncoder, never()).encode(anyString());
        }

        @Test
        @DisplayName("should deny users that are not visitors")
        void shouldDenyNonVisitors() {
            visitor.setRole(UserRole.ASSISTANT);
            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);

            assertBusinessException(
                    () -> service.createVisitorRegistrationRequest(validDto()), HttpStatus.FORBIDDEN,
                    "AUTH_FORBIDDEN");

            verify(patientRegistrationRequestRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 when the chosen company does not exist or is inactive")
        void shouldThrowWhenCompanyIsNotAvailable() {
            company.setActive(false);
            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));

            assertBusinessException(
                    () -> service.createVisitorRegistrationRequest(validDto()), HttpStatus.NOT_FOUND,
                    "COMPANY_NOT_FOUND");

            verify(patientRegistrationRequestRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 422 outside business hours")
        void shouldThrowOutsideBusinessHours() {
            businessHours.when(BusinessHoursValidator::isWithinBusinessHours).thenReturn(false);
            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));

            assertBusinessException(
                    () -> service.createVisitorRegistrationRequest(validDto()), HttpStatus.UNPROCESSABLE_CONTENT,
                    "OUTSIDE_BUSINESS_HOURS");

            verify(patientRegistrationRequestRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 409 when the visitor already has a request awaiting approval")
        void shouldThrowWhenVisitorAlreadyHasPendingRequest() {
            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(patientRegistrationRequestRepository.existsByRequestedBy_IdAndStatus(
                    visitor.getId(), PatientRegistrationRequestStatus.PENDING)).thenReturn(true);

            assertBusinessException(
                    () -> service.createVisitorRegistrationRequest(validDto()), HttpStatus.CONFLICT,
                    "REGISTRATION_REQUEST_ALREADY_PENDING");

            verify(patientRegistrationRequestRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 409 when the company already has a pending request for the same cpf")
        void shouldThrowWhenCpfAlreadyHasPendingRequest() {
            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(patientRegistrationRequestRepository.existsByCompanyIdAndCpfAndStatus(
                    company.getId(), VISITOR_CPF, PatientRegistrationRequestStatus.PENDING)).thenReturn(true);

            assertBusinessException(
                    () -> service.createVisitorRegistrationRequest(validDto()), HttpStatus.CONFLICT,
                    "REGISTRATION_REQUEST_ALREADY_PENDING");

            verify(patientRegistrationRequestRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 409 when the cpf already belongs to another user")
        void shouldThrowWhenCpfBelongsToAnotherUser() {
            User owner = User.builder().id(UUID.randomUUID()).cpf(VISITOR_CPF).role(UserRole.PATIENT).build();

            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findByCpf(VISITOR_CPF)).thenReturn(Optional.of(owner));

            assertBusinessException(
                    () -> service.createVisitorRegistrationRequest(validDto()), HttpStatus.CONFLICT,
                    "CPF_ALREADY_EXISTS");

            verify(patientRegistrationRequestRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getLatestVisitorRegistrationRequest")
    class GetLatestVisitorRegistrationRequest {

        @Test
        @DisplayName("should return empty when the visitor never asked to be registered")
        void shouldReturnEmptyWhenThereIsNoRequest() {
            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);
            when(patientRegistrationRequestRepository.findFirstByRequestedBy_IdOrderByCreatedAtDesc(visitor.getId()))
                    .thenReturn(Optional.empty());

            assertThat(service.getLatestVisitorRegistrationRequest()).isEmpty();
        }

        @Test
        @DisplayName("should return the most recent request with its company and status")
        void shouldReturnMostRecentRequest() {
            PatientRegistrationRequest request = PatientRegistrationRequest.builder()
                    .id(UUID.randomUUID())
                    .company(company)
                    .requestedBy(visitor)
                    .name("Luan Alves")
                    .cpf(VISITOR_CPF)
                    .birthDate(BIRTH_DATE)
                    .email(visitor.getEmail())
                    .status(PatientRegistrationRequestStatus.REJECTED)
                    .build();

            when(securityContextHelper.getCurrentUser()).thenReturn(visitor);
            when(patientRegistrationRequestRepository.findFirstByRequestedBy_IdOrderByCreatedAtDesc(visitor.getId()))
                    .thenReturn(Optional.of(request));

            assertThat(service.getLatestVisitorRegistrationRequest())
                    .hasValueSatisfying(dto -> {
                        assertThat(dto.companyId()).isEqualTo(company.getId());
                        assertThat(dto.companyName()).isEqualTo("Farmácia Central");
                        assertThat(dto.status()).isEqualTo(PatientRegistrationRequestStatus.REJECTED);
                    });
        }
    }

    @Nested
    @DisplayName("approveRequest")
    class ApproveRequest {

        private User staff;
        private PatientRegistrationRequest request;

        @BeforeEach
        void setUpApproval() {
            staff = User.builder()
                    .id(UUID.randomUUID())
                    .name("Gerente")
                    .email("gerente@example.com")
                    .role(UserRole.ADMIN)
                    .active(true)
                    .build();

            request = PatientRegistrationRequest.builder()
                    .id(UUID.randomUUID())
                    .company(company)
                    .requestedBy(visitor)
                    .name("Luan Alves")
                    .cpf(VISITOR_CPF)
                    .birthDate(BIRTH_DATE)
                    .contact("85999999999")
                    .address("Rua A, 100")
                    .email(visitor.getEmail())
                    .status(PatientRegistrationRequestStatus.PENDING)
                    .build();
        }

        @Test
        @DisplayName("should promote the visitor account to patient and create the patient record")
        void shouldPromoteVisitorAccount() {
            when(securityContextHelper.getCurrentUser()).thenReturn(staff);
            when(patientRegistrationRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));
            when(patientRepository.findByCompany_IdAndCpf(company.getId(), VISITOR_CPF)).thenReturn(Optional.empty());
            when(userRepository.findByCpf(VISITOR_CPF)).thenReturn(Optional.empty());
            when(userRepository.save(visitor)).thenReturn(visitor);
            when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));

            service.approveRequest(request.getId());

            assertThat(visitor.getRole()).isEqualTo(UserRole.PATIENT);
            assertThat(visitor.getCpf()).isEqualTo(VISITOR_CPF);
            assertThat(visitor.getPassword()).isNull();
            assertThat(visitor.getCompanies()).containsExactly(company);

            ArgumentCaptor<Patient> captor = ArgumentCaptor.forClass(Patient.class);
            verify(patientRepository).save(captor.capture());
            assertThat(captor.getValue().getUser()).isSameAs(visitor);
            assertThat(captor.getValue().getCompany()).isSameAs(company);
            assertThat(captor.getValue().getCpf()).isEqualTo(VISITOR_CPF);

            assertThat(request.getStatus()).isEqualTo(PatientRegistrationRequestStatus.APPROVED);
            assertThat(request.getReviewedBy()).isSameAs(staff);
        }

        @Test
        @DisplayName("should throw 409 when the cpf was taken by another user before the approval")
        void shouldThrowWhenCpfWasTakenMeanwhile() {
            User owner = User.builder().id(UUID.randomUUID()).cpf(VISITOR_CPF).role(UserRole.PATIENT).build();

            when(securityContextHelper.getCurrentUser()).thenReturn(staff);
            when(patientRegistrationRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));
            when(patientRepository.findByCompany_IdAndCpf(company.getId(), VISITOR_CPF)).thenReturn(Optional.empty());
            when(userRepository.findByCpf(VISITOR_CPF)).thenReturn(Optional.of(owner));

            assertBusinessException(
                    () -> service.approveRequest(request.getId()), HttpStatus.CONFLICT, "CPF_ALREADY_EXISTS");

            assertThat(visitor.getRole()).isEqualTo(UserRole.VISITOR);
            verify(patientRepository, never()).save(any(Patient.class));
        }
    }
}
