package com.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ChildDto;
import com.backend.dto.ChildResponseDto;
import com.backend.dto.PageResponseDto;
import com.backend.entity.Gender;
import com.backend.services.ChildService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/children")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChildController {

    private final ChildService childService;

    // GET /api/children - Paginated list of available children
    @GetMapping
    public ResponseEntity<PageResponseDto<ChildDto>> getAvailableChildren(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponseDto<ChildDto> response = childService.getAvailableChildren(page, size);
        return ResponseEntity.ok(response);
    }

    // GET /api/children/{id} - Get single available child details by ID
    @GetMapping("/{id}")
    public ResponseEntity<ChildDto> getAvailableChildById(@PathVariable Long id) {
        ChildDto child = childService.getAvailableChildById(id);
        return ResponseEntity.ok(child);
    }

    // Legacy GET /api/children/available
    @GetMapping("/available")
    public ResponseEntity<List<ChildResponseDto>> getAvailableChildrenLegacy() {
        List<ChildResponseDto> children = childService.getAvailableChildren();
        return ResponseEntity.ok(children);
    }

    // Legacy GET /api/children/search
    @GetMapping("/search")
    public ResponseEntity<List<ChildResponseDto>> searchChildrenByGender(
            @RequestParam Gender gender) {

        List<ChildResponseDto> children = childService.searchChildrenByGender(gender);
        return ResponseEntity.ok(children);
    }
}

