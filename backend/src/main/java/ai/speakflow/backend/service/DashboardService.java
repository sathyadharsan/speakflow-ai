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

        int confidence = 0;
        if (!sessions.isEmpty()) {
            confidence = (int) sessions.stream().mapToInt(PracticeSession::getConfidenceScore).average().orElse(0);
        }

        // Recent 5 sessions
        List<DashboardResponse.PracticeSessionDto> recentDto = sessions.stream()
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

        // Mock streak for demo
        int streak = totalSessions > 0 ? 5 + (int) (totalSessions / 10) : 0;
        String insight = totalSessions > 3 ? "Your speaking confidence improved by 12% this week. Keep practicing!"
                : "Welcome! Start your first session to see insights.";

        return DashboardResponse.builder()
                .userName(user.getName())
                .practiceSessions(totalSessions)
                .streak(streak)
                .confidenceScore(confidence > 0 ? confidence : 65)
                .progressInsight(insight)
                .recentSessions(recentDto)
                .build();
    }
}
