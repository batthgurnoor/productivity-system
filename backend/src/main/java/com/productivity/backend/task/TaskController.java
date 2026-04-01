package com.productivity.backend.task;

import com.productivity.backend.security.UserPrincipal;
import com.productivity.backend.task.dto.TaskDtos.CreateTaskRequest;
import com.productivity.backend.task.dto.TaskDtos.TaskResponse;
import com.productivity.backend.task.dto.TaskDtos.UpdateTaskRequest;
import com.productivity.backend.user.UserRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
	private final TaskRepository taskRepository;
	private final UserRepository userRepository;

	public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
		this.taskRepository = taskRepository;
		this.userRepository = userRepository;
	}

	@GetMapping
	public List<TaskResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
		return taskRepository.findAllByUserIdOrderByCreatedAtDesc(principal.userId()).stream().map(TaskResponse::from).toList();
	}

	@PostMapping
	public ResponseEntity<?> create(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody CreateTaskRequest req) {
		var userOpt = userRepository.findById(principal.userId());
		if (userOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		var t = new Task(userOpt.get(), req.title(), req.description(), req.priority(), req.dueDate());
		t.setStatus(req.status());
		if (req.status() == TaskStatus.DONE) {
			t.setCompletedAt(Instant.now());
		}
		return ResponseEntity.status(HttpStatus.CREATED).body(TaskResponse.from(taskRepository.save(t)));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(
		@AuthenticationPrincipal UserPrincipal principal,
		@PathVariable Long id,
		@Valid @RequestBody UpdateTaskRequest req
	) {
		var tOpt = taskRepository.findByIdAndUserId(id, principal.userId());
		if (tOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("Task not found"));
		}

		var t = tOpt.get();
		t.setTitle(req.title());
		t.setDescription(req.description());
		t.setPriority(req.priority());
		t.setDueDate(req.dueDate());
		t.setUpdatedAt(Instant.now());

		var prevStatus = t.getStatus();
		t.setStatus(req.status());
		if (prevStatus != TaskStatus.DONE && req.status() == TaskStatus.DONE) {
			t.setCompletedAt(Instant.now());
		} else if (prevStatus == TaskStatus.DONE && req.status() != TaskStatus.DONE) {
			t.setCompletedAt(null);
		}

		return ResponseEntity.ok(TaskResponse.from(taskRepository.save(t)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
		var tOpt = taskRepository.findByIdAndUserId(id, principal.userId());
		if (tOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("Task not found"));
		}
		taskRepository.delete(tOpt.get());
		return ResponseEntity.noContent().build();
	}

	record ApiError(String message) {}
}

