package com.backend.services;

import java.util.List;
import com.backend.dto.AdoptionRecordResponseDto;

public interface AdoptionRecordService {
    List<AdoptionRecordResponseDto> getMyAdoptionRecords(Long userId, String email);
}
