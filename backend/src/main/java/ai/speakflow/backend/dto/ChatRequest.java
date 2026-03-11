package ai.speakflow.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;
}
