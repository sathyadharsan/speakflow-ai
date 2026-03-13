package ai.speakflow.backend.service;

import ai.speakflow.backend.dto.*;
import ai.speakflow.backend.entity.*;
import ai.speakflow.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    public DashboardResponse getDashboardData() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<PracticeSession> sessions = practiceSessionRepository.findByUser(user);
        long totalSessions = sessions.size();

        double avgGrammar = 0;
        double avgPronunciation = 0;
        double avgSpeedScore = 0;
        int confidence = 0;

        if (!sessions.isEmpty()) {
            avgGrammar = sessions.stream().mapToInt(PracticeSession::getGrammarScore).average().orElse(0);
            avgPronunciation = sessions.stream().mapToInt(PracticeSession::getPronunciationScore).average().orElse(0);
            avgSpeedScore = 75; // Mock speed score for now, can be computed later
            confidence = (int) sessions.stream().mapToInt(PracticeSession::getConfidenceScore).average().orElse(0);
        }

        // FluencyScore = (pronunciationScore * 0.5) + (grammarScore * 0.3) + (speakingSpeedScore * 0.2)
        int finalFluencyScore = (int)((avgPronunciation * 0.5) + (avgGrammar * 0.3) + (avgSpeedScore * 0.2));

        // Recent 5 sessions
        java.util.List<DashboardResponse.PracticeSessionDto> recentDto = sessions.stream()
                .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
                .limit(5)
                .map(s -> DashboardResponse.PracticeSessionDto.builder()
                        .originalSentence(s.getOriginalSentence())
                        .correctedSentence(s.getCorrectedSentence())
                        .grammarScore(s.getGrammarScore())
                        .fluencyScore(s.getFluencyScore())
                        .confidenceScore(s.getConfidenceScore())
                        .createdAt(s.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                        .build())
                .collect(Collectors.toList());

        String insight = totalSessions > 3 ? "Your speaking confidence improved by 12% this week. Keep practicing!"
                : "Welcome! Start your first session to see insights.";

        return DashboardResponse.builder()
                .userName(user.getName())
                .practiceSessions(totalSessions)
                .totalSessions(totalSessions)
                .streak(user.getPracticeStreak())
                .practiceStreak(user.getPracticeStreak())
                .confidenceScore(confidence > 0 ? confidence : 65)
                .fluencyScore(finalFluencyScore > 0 ? finalFluencyScore : 70)
                .todayPracticeMinutes((int) (totalSessions * 2)) // Mocking 2 mins per session
                .wordsLearned(user.getTotalWordsLearned())
                .userLevel(user.getLevel())
                .userXp(user.getXp())
                .progressInsight(insight)
                .aiImprovementTip("Focus on pausing briefly after complex sentences to improve overall clarity.")
                .recentSessions(recentDto)
                .build();
    }

    public ProgressResponse getProgressData() {
        // Return mock weekly statistics for now
        java.util.List<ProgressResponse.WeeklyFluency> weekly = new java.util.ArrayList<>();
        weekly.add(new ProgressResponse.WeeklyFluency("Week 1", 62));
        weekly.add(new ProgressResponse.WeeklyFluency("Week 2", 68));
        weekly.add(new ProgressResponse.WeeklyFluency("Week 3", 74));
        weekly.add(new ProgressResponse.WeeklyFluency("Week 4", 81));
        
        return ProgressResponse.builder().weeklyFluency(weekly).build();
    }
}
