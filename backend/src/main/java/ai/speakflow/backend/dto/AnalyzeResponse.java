package ai.speakflow.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeResponse {
    private String originalSentence;
    private String correctedSentence;
    private String explanation;
    private String betterSentence;
    private int grammarScore;
    private int fluencyScore;
    private int confidenceScore;
}
