package com.productivity.backend.task;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
	List<Task> findAllByUserIdOrderByCreatedAtDesc(Long userId);
	Optional<Task> findByIdAndUserId(Long id, Long userId);
}

