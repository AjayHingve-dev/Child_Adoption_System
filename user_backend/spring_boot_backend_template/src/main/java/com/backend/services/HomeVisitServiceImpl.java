package com.backend.services;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.ParentHomeVisitDto;
import com.backend.dto.SocialWorkerHomeVisitDto;
import com.backend.entity.HomeVisit;
import com.backend.entity.SocialWorker;
import com.backend.entity.User;

import com.backend.repository.HomeVisitRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class HomeVisitServiceImpl implements HomeVisitService {

    private final HomeVisitRepository homeVisitRepository;
    private final UserRepository userRepository;

    @Override
    public List<ParentHomeVisitDto> getMyHomeVisits(Long userId, String email) {
        List<HomeVisit> visits = new ArrayList<>();

        if (userId != null) {
            visits = homeVisitRepository.findByRequestUserUserIdOrderByScheduledDateDescScheduledTimeDesc(userId);
        }

        if (visits.isEmpty() && email != null && !email.trim().isEmpty()) {
            visits = homeVisitRepository.findByRequestUserEmailOrderByScheduledDateDescScheduledTimeDesc(email);
        }

        if (visits.isEmpty() && userId == null && (email == null || email.trim().isEmpty())) {
            // If neither parameter was resolved, return empty list
            return new ArrayList<>();
        }

        return visits.stream()
                .map(this::mapToParentHomeVisitDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<SocialWorkerHomeVisitDto> getSocialWorkerHomeVisits(Long socialWorkerId, String email) {
        List<HomeVisit> visits = new ArrayList<>();

        if (socialWorkerId != null) {
            visits = homeVisitRepository.findBySocialWorkerSocialWorkerIdOrderByScheduledDateDescScheduledTimeDesc(socialWorkerId);
        }

        if (visits.isEmpty() && email != null && !email.trim().isEmpty()) {
            visits = homeVisitRepository.findBySocialWorkerEmailOrderByScheduledDateDescScheduledTimeDesc(email);
        }

        return visits.stream()
                .map(this::mapToSocialWorkerHomeVisitDto)
                .collect(Collectors.toList());
    }

    private SocialWorkerHomeVisitDto mapToSocialWorkerHomeVisitDto(HomeVisit visit) {
        String parentName = null;
        String address = null;
        String childName = null;
        String applicationNumber = null;
        Long requestId = null;

        if (visit.getRequest() != null) {
            requestId = visit.getRequest().getRequestId();
            applicationNumber = visit.getRequest().getApplicationNumber();

            if (visit.getRequest().getUser() != null) {
                User u = visit.getRequest().getUser();
                String fn = u.getFirstName() != null ? u.getFirstName() : "";
                String ln = u.getLastName() != null ? u.getLastName() : "";
                parentName = (fn + " " + ln).trim();

                address = u.getAddress();
                if (address == null || address.trim().isEmpty()) {
                    List<String> parts = new ArrayList<>();
                    if (u.getCity() != null && !u.getCity().trim().isEmpty()) parts.add(u.getCity().trim());
                    if (u.getState() != null && !u.getState().trim().isEmpty()) parts.add(u.getState().trim());
                    if (u.getPincode() != null && !u.getPincode().trim().isEmpty()) parts.add(u.getPincode().trim());
                    address = String.join(", ", parts);
                }
            }

            if (visit.getRequest().getChild() != null) {
                String cFname = visit.getRequest().getChild().getFirstName() != null ? visit.getRequest().getChild().getFirstName() : "";
                String cLname = visit.getRequest().getChild().getLastName() != null ? visit.getRequest().getChild().getLastName() : "";
                childName = (cFname + " " + cLname).trim();
            }
        }

        if (parentName == null || parentName.trim().isEmpty()) {
            parentName = "—";
        }
        if (address == null || address.trim().isEmpty()) {
            address = "N/A";
        }

        return SocialWorkerHomeVisitDto.builder()
                .homeVisitId(visit.getHomeVisitId())
                .visitCode(visit.getVisitCode())
                .visitDate(visit.getScheduledDate())
                .scheduledDate(visit.getScheduledDate())
                .visitTime(visit.getScheduledTime())
                .scheduledTime(visit.getScheduledTime())
                .parentName(parentName)
                .address(address)
                .status(visit.getStatus())
                .remarks(visit.getRemarks())
                .requestId(requestId)
                .applicationNumber(applicationNumber)
                .childName(childName)
                .overallImpression(visit.getOverallImpression())
                .familyEnvironment(visit.getFamilyEnvironment())
                .financialStability(visit.getFinancialStability())
                .familySupport(visit.getFamilySupport())
                .anyConcern(visit.getAnyConcern())
                .completedAt(visit.getCompletedAt())
                .createdAt(visit.getCreatedAt())
                .build();
    }

    private ParentHomeVisitDto mapToParentHomeVisitDto(HomeVisit visit) {
        SocialWorker worker = visit.getSocialWorker();
        String workerName = null;
        String workerPhone = null;
        String workerEmail = null;

        if (worker != null) {
            String fname = worker.getFirstName() != null ? worker.getFirstName() : "";
            String lname = worker.getLastName() != null ? worker.getLastName() : "";
            workerName = (fname + " " + lname).trim();
            if (workerName.isEmpty()) {
                workerName = "Social Worker #" + worker.getSocialWorkerId();
            }
            workerPhone = worker.getPhone();
            workerEmail = worker.getEmail();
        } else {
            workerName = "Unassigned";
        }

        String childName = null;
        String applicationNumber = null;
        Long requestId = null;

        if (visit.getRequest() != null) {
            requestId = visit.getRequest().getRequestId();
            applicationNumber = visit.getRequest().getApplicationNumber();
            if (visit.getRequest().getChild() != null) {
                String cFname = visit.getRequest().getChild().getFirstName() != null ? visit.getRequest().getChild().getFirstName() : "";
                String cLname = visit.getRequest().getChild().getLastName() != null ? visit.getRequest().getChild().getLastName() : "";
                childName = (cFname + " " + cLname).trim();
            }
        }

        return ParentHomeVisitDto.builder()
                .homeVisitId(visit.getHomeVisitId())
                .visitCode(visit.getVisitCode())
                .visitDate(visit.getScheduledDate())
                .visitTime(visit.getScheduledTime())
                .assignedSocialWorker(workerName)
                .socialWorker(workerName)
                .socialWorkerPhone(workerPhone)
                .socialWorkerEmail(workerEmail)
                .remarks(visit.getRemarks())
                .status(visit.getStatus())
                .requestId(requestId)
                .applicationNumber(applicationNumber)
                .childName(childName)
                .overallImpression(visit.getOverallImpression())
                .familyEnvironment(visit.getFamilyEnvironment())
                .financialStability(visit.getFinancialStability())
                .familySupport(visit.getFamilySupport())
                .anyConcern(visit.getAnyConcern())
                .completedAt(visit.getCompletedAt())
                .createdAt(visit.getCreatedAt())
                .build();
    }
}
