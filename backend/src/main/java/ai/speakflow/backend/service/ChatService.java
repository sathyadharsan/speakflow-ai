package ai.speakflow.backend.service;

import ai.speakflow.backend.dto.*;
import ai.speakflow.backend.entity.*;
import ai.speakflow.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

        @Autowired
        private ChatSessionRepository chatSessionRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private AIService aiService;

        public ChatResponse processChatMessage(ChatRequest request) {
                String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                                .getUsername();
                User user = userRepository.findByEmail(email).orElseThrow();

                String message = request.getMessage();

                // Call Real AI via Groq
                java.util.Map<String, String> aiResult = aiService.analyzeSentence(message);

                String corrected = aiResult.getOrDefault("corrected", message);
                String explanation = aiResult.getOrDefault("explanation", "Good grammar!");
                String suggestion = aiResult.getOrDefault("better", corrected);

                ChatSession session = ChatSession.builder()
                                .user(user)
                                .userMessage(message)
                                .correctedSentence(corrected)
                                .explanation(explanation)
                                .build();

                chatSessionRepository.save(session);

                return ChatResponse.builder()
                                .userMessage(message)
                                .correctedSentence(corrected)
                                .explanation(explanation)
                                .suggestion(suggestion)
                                .build();
        }
}
