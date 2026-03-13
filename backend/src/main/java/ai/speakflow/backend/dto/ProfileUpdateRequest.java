package ai.speakflow.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String name;
    private String preferredLanguage;
    private String learningGoal;
}
