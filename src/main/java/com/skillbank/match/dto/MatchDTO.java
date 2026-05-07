package com.skillbank.match.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MatchDTO {
    private Long userId;
    private String name;
    private String city;
    private String bio;
    private String profilePicUrl;
    private List<String> skillsTheyOffer;
    private List<String> skillsTheySeek;
}
