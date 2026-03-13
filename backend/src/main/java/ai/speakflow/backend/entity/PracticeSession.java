package ai.speakflow.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "practice_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String originalSentence;

    @Column(columnDefinition = "TEXT")
    private String correctedSentence;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private Integer grammarScore;
    private Integer fluencyScore;
    private Integer confidenceScore;
    private Integer pronunciationScore;
    private Double speakingSpeed; // words per min
    private Integer totalWords;
    
    @Column(columnDefinition = "TEXT")
    private String improvementTip;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
