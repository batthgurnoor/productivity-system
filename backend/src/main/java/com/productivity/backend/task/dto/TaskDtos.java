package com.productivity.backend.task.dto;

import com.productivity.backend.task.Task;
import com.productivity.backend.task.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;

public class TaskDtos {
	public record TaskResponse(
		Long id,
		String title,
		String description,
		TaskStatus status,
		int priority,
		LocalDate dueDate,
		Instant createdAt,
		Instant updatedAt,
		Instant completedAt
	) {
		public static TaskResponse from(Task t) {
			return new TaskResponse(
				t.getId(),
				t.getTitle(),
				t.getDescription(),
				t.getStatus(),
				t.getPriority(),
				t.getDueDate(),
				t.getCreatedAt(),
				t.getUpdatedAt(),
				t.getCompletedAt()
			);
		}
	}

	public record CreateTaskRequest(
		@NotBlank @Size(max = 200) String title,
		@Size(max = 2000) String description,
		@NotNull TaskStatus status,
		@Min(1) @Max(3) int priority,
		LocalDate dueDate
	) {}

	public record UpdateTaskRequest(
		@NotBlank @Size(max = 200) String title,
		@Size(max = 2000) String description,
		@NotNull TaskStatus status,
		@Min(1) @Max(3) int priority,
		LocalDate dueDate
	) {}
}

