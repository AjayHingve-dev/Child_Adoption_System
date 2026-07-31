package com.backend.controllers;

import com.backend.dto.ChildResponseDto;
import com.backend.entity.BloodGroup;
import com.backend.entity.Gender;
import com.backend.services.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/children")
@RequiredArgsConstructor
public class ChildController{

    private final ChildService childService;

    
 // View only available children
    @GetMapping("/available")
    public ResponseEntity<List<ChildResponseDto>> getAvailableChildren() {

        List<ChildResponseDto> children = childService.getAvailableChildren();
        return ResponseEntity.ok(children);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ChildResponseDto>> searchChildrenByGender(
            @RequestParam Gender gender) {

        List<ChildResponseDto> children =
                childService.searchChildrenByGender(gender);

        return ResponseEntity.ok(children);
    }
}
