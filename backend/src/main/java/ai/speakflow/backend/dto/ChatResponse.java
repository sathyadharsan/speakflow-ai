package ai.speakflow.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String userMessage;
    private String correctedSentence;
    private String explanation;
    private String suggestion;
}
