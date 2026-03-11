package ai.speakflow.backend.repository;

import ai.speakflow.backend.entity.ChatSession;
import ai.speakflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserOrderByCreatedAtDesc(User user);
}
