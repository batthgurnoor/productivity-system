package com.productivity.backend.task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {
	List<Task> findAllByUserIdOrderByCreatedAtDesc(Long userId);

	Optional<Task> findByIdAndUserId(Long id, Long userId);

	long countByUserIdAndCreatedAtGreaterThanEqualAndCreatedAtBefore(
		Long userId,
		Instant createdAtFromInclusive,
		Instant createdAtBeforeExclusive
	);

	long countByUserIdAndStatusAndCompletedAtIsNotNullAndCompletedAtGreaterThanEqualAndCompletedAtBefore(
		Long userId,
		TaskStatus status,
		Instant completedAtFromInclusive,
		Instant completedAtBeforeExclusive
	);

	long countByUserIdAndStatusIsNotAndDueDateBefore(Long userId, TaskStatus status, LocalDate dueDateBefore);

	long countByUserIdAndStatus(Long userId, TaskStatus status);

	@Query(
		"""
		select t.completedAt from Task t
		where t.user.id = :userId
		  and t.status = :status
		  and t.completedAt is not null
		  and t.completedAt >= :fromInclusive
		  and t.completedAt < :beforeExclusive
		"""
	)
	List<Instant> findCompletedAtInRange(
		@Param("userId") Long userId,
		@Param("status") TaskStatus status,
		@Param("fromInclusive") Instant fromInclusive,
		@Param("beforeExclusive") Instant beforeExclusive
	);
}

