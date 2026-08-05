package com.backend.services;

import java.util.List;

import com.backend.dto.ParentHomeVisitDto;
import com.backend.dto.SocialWorkerHomeVisitDto;

import com.backend.dto.VisitReportRequestDto;
import com.backend.dto.VisitReportResponseDto;

public interface HomeVisitService {
    List<ParentHomeVisitDto> getMyHomeVisits(Long userId, String email);
    List<SocialWorkerHomeVisitDto> getSocialWorkerHomeVisits(Long socialWorkerId, String email);
    VisitReportResponseDto submitVisitReport(Long visitId, VisitReportRequestDto requestDto);
}
