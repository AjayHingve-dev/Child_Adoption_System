package com.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdoptionRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Child ID is required")
    private Long childId;
}