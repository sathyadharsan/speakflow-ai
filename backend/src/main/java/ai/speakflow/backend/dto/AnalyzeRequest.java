package ai.speakflow.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeRequest {
    private String sentence;
}
