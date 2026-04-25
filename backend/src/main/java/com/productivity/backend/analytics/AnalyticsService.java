package com.productivity.backend.analytics;

import com.productivity.backend.analytics.AnalyticsDtos.CompletionDay;
import com.productivity.backend.analytics.AnalyticsDtos.StatusCounts;
import com.productivity.backend.analytics.AnalyticsDtos.Summary;
import com.productivity.backend.task.TaskRepository;
import com.productivity.backend.task.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {
	static final int MAX_RANGE_DAYS = 366;

	private final TaskRepository taskRepository;

	public AnalyticsService(TaskRepository taskRepository) {
		this.taskRepository = taskRepository;
	}

	public Summary summary(long userId, LocalDate from, LocalDate to) {
		if (from.isAfter(to)) {
			throw new IllegalArgumentException("'from' must be on or before 'to'");
		}
		if (ChronoUnit.DAYS.between(from, to) > MAX_RANGE_DAYS) {
			throw new IllegalArgumentException("Date range too large (max " + MAX_RANGE_DAYS + " days)");
		}

		ZoneId zone = ZoneId.systemDefault();
		Instant rangeStart = from.atStartOfDay(zone).toInstant();
		Instant rangeEndExclusive = to.plusDays(1).atStartOfDay(zone).toInstant();
		LocalDate today = LocalDate.now(zone);

		long createdInRange = taskRepository.countByUserIdAndCreatedAtGreaterThanEqualAndCreatedAtBefore(
			userId,
			rangeStart,
			rangeEndExclusive
		);
		long completedInRange =
			taskRepository.countByUserIdAndStatusAndCompletedAtIsNotNullAndCompletedAtGreaterThanEqualAndCompletedAtBefore(
				userId,
				TaskStatus.DONE,
				rangeStart,
				rangeEndExclusive
			);
		long overdueNotDone = taskRepository.countByUserIdAndStatusIsNotAndDueDateBefore(userId, TaskStatus.DONE, today);

		long todo = taskRepository.countByUserIdAndStatus(userId, TaskStatus.TODO);
		long inProgress = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
		long done = taskRepository.countByUserIdAndStatus(userId, TaskStatus.DONE);
		StatusCounts byStatus = new StatusCounts(todo, inProgress, done);

		List<Instant> completedAts = taskRepository.findCompletedAtInRange(
			userId,
			TaskStatus.DONE,
			rangeStart,
			rangeEndExclusive
		);
		Map<LocalDate, Long> countsByDay = new HashMap<>();
		for (Instant at : completedAts) {
			LocalDate day = at.atZone(zone).toLocalDate();
			countsByDay.merge(day, 1L, Long::sum);
		}
		List<CompletionDay> completionsByDay = new ArrayList<>();
		for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
			completionsByDay.add(new CompletionDay(d, countsByDay.getOrDefault(d, 0L)));
		}

		return new Summary(
			from,
			to,
			createdInRange,
			completedInRange,
			overdueNotDone,
			byStatus,
			completionsByDay
		);
	}
}
