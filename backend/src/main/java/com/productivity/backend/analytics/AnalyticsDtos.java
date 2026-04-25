package com.productivity.backend.analytics;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;

public class AnalyticsDtos {
	public record Summary(
		LocalDate from,
		LocalDate to,
		long createdInRange,
		long completedInRange,
		long overdueNotDone,
		StatusCounts byStatus,
		List<CompletionDay> completionsByDay
	) {}

	public record StatusCounts(
		@JsonProperty("TODO") long todo,
		@JsonProperty("IN_PROGRESS") long inProgress,
		@JsonProperty("DONE") long done
	) {}

	public record CompletionDay(LocalDate date, long count) {}
}
