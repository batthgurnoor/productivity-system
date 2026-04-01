package com.productivity.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
	private final SecretKey key;
	private final long accessTokenMinutes;

	public JwtService(
		@Value("${app.jwt.secret}") String secret,
		@Value("${app.jwt.accessTokenMinutes}") long accessTokenMinutes
	) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessTokenMinutes = accessTokenMinutes;
	}

	public String issueAccessToken(long userId, String email) {
		Instant now = Instant.now();
		Instant exp = now.plus(accessTokenMinutes, ChronoUnit.MINUTES);

		return Jwts.builder()
			.subject(Long.toString(userId))
			.claim("email", email)
			.issuedAt(Date.from(now))
			.expiration(Date.from(exp))
			.signWith(key, SignatureAlgorithm.HS256)
			.compact();
	}

	public JwtUser parse(String token) {
		var claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
		long userId = Long.parseLong(claims.getSubject());
		String email = claims.get("email", String.class);
		return new JwtUser(userId, email);
	}

	public record JwtUser(long userId, String email) {}
}

