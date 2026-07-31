package com.backend.controllers;

import com.backend.dto.ChildResponseDto;
import com.backend.entity.Gender;
import com.backend.services.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/children")
@RequiredArgsConstructor
public class ChildController {

    private final ChildService childService;

    // GET /api/children - Paginated list of available children only
    @GetMapping
    public ResponseEntity<Page<ChildResponseDto>> getAvailableChildrenPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "childId") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ChildResponseDto> children = childService.getAvailableChildren(pageable);
        return ResponseEntity.ok(children);
    }

    // GET /api/children/{id} - Details of child by ID
    @GetMapping("/{id}")
    public ResponseEntity<ChildResponseDto> getChildById(@PathVariable Long id) {
        ChildResponseDto child = childService.getChildById(id);
        return ResponseEntity.ok(child);
    }

    // View only available children (unpaginated)
    @GetMapping("/available")
    public ResponseEntity<List<ChildResponseDto>> getAvailableChildren() {
        List<ChildResponseDto> children = childService.getAvailableChildren();
        return ResponseEntity.ok(children);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ChildResponseDto>> searchChildrenByGender(
            @RequestParam Gender gender) {

        List<ChildResponseDto> children = childService.searchChildrenByGender(gender);
        return ResponseEntity.ok(children);
    }
}
