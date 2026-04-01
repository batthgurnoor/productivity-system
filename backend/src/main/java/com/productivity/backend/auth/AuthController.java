package com.productivity.backend.auth;

import com.productivity.backend.auth.dto.AuthDtos.AuthResponse;
import com.productivity.backend.auth.dto.AuthDtos.LoginRequest;
import com.productivity.backend.auth.dto.AuthDtos.RegisterRequest;
import com.productivity.backend.security.JwtService;
import com.productivity.backend.user.User;
import com.productivity.backend.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
		if (userRepository.existsByEmailIgnoreCase(req.email())) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("Email already in use"));
		}

		String hash = passwordEncoder.encode(req.password());
		User user = userRepository.save(new User(req.email().trim().toLowerCase(), hash));
		String token = jwtService.issueAccessToken(user.getId(), user.getEmail());
		return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token));
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
		var userOpt = userRepository.findByEmailIgnoreCase(req.email());
		if (userOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError("Invalid credentials"));
		}
		User user = userOpt.get();
		if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError("Invalid credentials"));
		}

		String token = jwtService.issueAccessToken(user.getId(), user.getEmail());
		return ResponseEntity.ok(new AuthResponse(token));
	}

	record ApiError(String message) {}
}

