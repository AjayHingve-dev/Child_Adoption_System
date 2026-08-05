package com.backend.services;

import java.util.List;

import com.backend.dto.ParentHomeVisitDto;
import com.backend.dto.SocialWorkerHomeVisitDto;

public interface HomeVisitService {
    List<ParentHomeVisitDto> getMyHomeVisits(Long userId, String email);
    List<SocialWorkerHomeVisitDto> getSocialWorkerHomeVisits(Long socialWorkerId, String email);
}
