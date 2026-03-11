package ai.speakflow.backend.service;

import ai.speakflow.backend.dto.TranslateRequest;
import ai.speakflow.backend.dto.TranslateResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TranslationService {

    @Value("${groq.api.key}")
    private String apiKey;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TranslateResponse translate(TranslateRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.1-8b-instant");

            List<Map<String, String>> messages = new ArrayList<>();

            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content",
                    "You are a helpful Tamil and Tanglish to English translator. " +
                            "Your task is to translate the given user text into natural, correct English. " +
                            "Only return the translated English text. Do not provide any other information.");
            messages.add(systemMessage);

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", "Translate this: " + request.getText());
            messages.add(userMessage);

            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String rawResponse = restTemplate.postForObject(API_URL, entity, String.class);

            JsonNode root = objectMapper.readTree(rawResponse);
            String translatedText = root.path("choices").get(0).path("message").path("content").asText().trim();

            return TranslateResponse.builder()
                    .english(translatedText)
                    .build();

        } catch (Exception e) {
            return TranslateResponse.builder()
                    .english("Translation Error: " + e.getMessage())
                    .build();
        }
    }
}
