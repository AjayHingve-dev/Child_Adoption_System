package com.backend.services;

import java.util.List;

import com.backend.dto.ParentHomeVisitDto;

public interface HomeVisitService {
    List<ParentHomeVisitDto> getMyHomeVisits(Long userId, String email);
}
