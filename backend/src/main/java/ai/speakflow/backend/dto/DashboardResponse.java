package ai.speakflow.backend.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private String userName;
    private long practiceSessions;
    private int streak;
    private int confidenceScore;
    private int fluencyScore;
    private int practiceStreak;
    private long totalSessions;
    private long wordsLearned;
    private int todayPracticeMinutes;
    private int userLevel;
    private int userXp;
    private String progressInsight;
    private String aiImprovementTip;
    private List<PracticeSessionDto> recentSessions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PracticeSessionDto {
        private String originalSentence;
        private String correctedSentence;
        private int grammarScore;
        private int fluencyScore;
        private int confidenceScore;
        private String createdAt;
    }
}
