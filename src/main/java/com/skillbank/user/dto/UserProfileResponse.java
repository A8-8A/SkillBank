package com.skillbank.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String city;
    private String phoneNumber;
    private String role;
    private BigDecimal balance;
    private LocalDateTime createdAt;
}
