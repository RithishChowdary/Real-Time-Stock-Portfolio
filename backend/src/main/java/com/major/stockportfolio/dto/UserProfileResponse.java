package com.major.stockportfolio.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserProfileResponse {

    private Long id;

    private String name;

    private String email;

    private String role;
}