package ai.speakflow.backend.repository;

import ai.speakflow.backend.entity.PracticeSession;
import ai.speakflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {
    List<PracticeSession> findByUser(User user);

    long countByUser(User user);
}
