package com.backend.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BloodGroupConverter implements AttributeConverter<BloodGroup, String> {

    @Override
    public String convertToDatabaseColumn(BloodGroup attribute) {
        if (attribute == null) {
            return null;
        }
        switch (attribute) {
            case A_POSITIVE: return "A+";
            case A_NEGATIVE: return "A-";
            case B_POSITIVE: return "B+";
            case B_NEGATIVE: return "B-";
            case AB_POSITIVE: return "AB+";
            case AB_NEGATIVE: return "AB-";
            case O_POSITIVE: return "O+";
            case O_NEGATIVE: return "O-";
            default: return attribute.name();
        }
    }

    @Override
    public BloodGroup convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        String cleaned = dbData.trim().toUpperCase();
        switch (cleaned) {
            case "A+":
            case "A_POSITIVE":
            case "A_POS":
                return BloodGroup.A_POSITIVE;
            case "A-":
            case "A_NEGATIVE":
            case "A_NEG":
                return BloodGroup.A_NEGATIVE;
            case "B+":
            case "B_POSITIVE":
            case "B_POS":
                return BloodGroup.B_POSITIVE;
            case "B-":
            case "B_NEGATIVE":
            case "B_NEG":
                return BloodGroup.B_NEGATIVE;
            case "AB+":
            case "AB_POSITIVE":
            case "AB_POS":
                return BloodGroup.AB_POSITIVE;
            case "AB-":
            case "AB_NEGATIVE":
            case "AB_NEG":
                return BloodGroup.AB_NEGATIVE;
            case "O+":
            case "O_POSITIVE":
            case "O_POS":
                return BloodGroup.O_POSITIVE;
            case "O-":
            case "O_NEGATIVE":
            case "O_NEG":
                return BloodGroup.O_NEGATIVE;
            default:
                try {
                    return BloodGroup.valueOf(cleaned);
                } catch (Exception e) {
                    return null;
                }
        }
    }
}
