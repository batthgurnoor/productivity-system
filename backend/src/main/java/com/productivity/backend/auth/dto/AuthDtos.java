package com.productivity.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
	public record RegisterRequest(
		@NotBlank @Email String email,
		@NotBlank @Size(min = 8, max = 72) String password
	) {}

	public record LoginRequest(
		@NotBlank @Email String email,
		@NotBlank String password
	) {}

	public record AuthResponse(String accessToken) {}
}

