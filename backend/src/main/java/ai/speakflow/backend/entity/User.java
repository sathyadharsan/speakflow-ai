package ai.speakflow.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer xp = 0;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 1")
    private Integer level = 1;

    @Builder.Default
    @Column(columnDefinition = "varchar(255) default 'English'")
    private String preferredLanguage = "English";

    @Builder.Default
    @Column(columnDefinition = "varchar(255) default 'Daily Conversation'")
    private String learningGoal = "Daily Conversation";

    @Builder.Default
    @Column(nullable = false, columnDefinition = "bigint default 0")
    private Long totalWordsLearned = 0L;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer practiceStreak = 0;

    private LocalDateTime createdAt;

    // Safe getters to handle existing null rows in DB
    public Integer getXp() {
        return xp == null ? 0 : xp;
    }

    public Integer getLevel() {
        return level == null ? 1 : level;
    }

    public Long getTotalWordsLearned() {
        return totalWordsLearned == null ? 0L : totalWordsLearned;
    }

    public Integer getPracticeStreak() {
        return practiceStreak == null ? 0 : practiceStreak;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (xp == null) xp = 0;
        if (level == null) level = 1;
        if (totalWordsLearned == null) totalWordsLearned = 0L;
        if (practiceStreak == null) practiceStreak = 0;
    }
}
