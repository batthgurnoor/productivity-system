package com.productivity.backend.analytics;

import com.productivity.backend.analytics.AnalyticsDtos.Summary;
import com.productivity.backend.security.UserPrincipal;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
	private final AnalyticsService analyticsService;

	public AnalyticsController(AnalyticsService analyticsService) {
		this.analyticsService = analyticsService;
	}

	/**
	 * Aggregated task stats for the signed-in user.
	 *
	 * @param from start date inclusive (default: 29 days before {@code to})
	 * @param to end date inclusive (default: today in the JVM default timezone)
	 */
	@GetMapping("/summary")
	public Summary summary(
		@AuthenticationPrincipal UserPrincipal principal,
		@RequestParam(required = false) LocalDate from,
		@RequestParam(required = false) LocalDate to
	) {
		LocalDate toDate = to != null ? to : LocalDate.now();
		LocalDate fromDate = from != null ? from : toDate.minusDays(29);
		try {
			return analyticsService.summary(principal.userId(), fromDate, toDate);
		} catch (IllegalArgumentException e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
		}
	}
}
