package ai.speakflow.backend.service;

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
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String chat(String message) {
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
                    "You are an expert English tutor for beginners. The user may write in English, Tamil, or Tanglish. Your job is to correct the sentence and explain the grammar mistake clearly.\n\n"
                            +
                            "Follow these rules strictly:\n" +
                            "1. Convert the sentence into correct natural English.\n" +
                            "2. Provide a grammar explanation in English.\n" +
                            "3. Provide the same explanation in Tanglish (Tamil written using English letters).\n" +
                            "4. Provide a better English sentence suggestion.\n\n" +
                            "IMPORTANT RULES:\n" +
                            "* The English explanation and Tanglish explanation must be in separate sections.\n" +
                            "* Do NOT write \"English:\" or \"Tanglish:\" inside the explanation text.\n" +
                            "* Do NOT combine the explanations.\n" +
                            "* Do NOT include Tamil script.\n" +
                            "* Keep explanations simple and easy to understand.\n\n" +
                            "Return the response EXACTLY in this structure:\n\n" +
                            "English Sentence: <correct English sentence>\n\n" +
                            "Explanation (English): <short explanation in English>\n\n" +
                            "Explanation (Tanglish): <same explanation written in Tanglish>\n\n" +
                            "Suggestion: <better English sentence>");
            messages.add(systemMessage);

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", "Correct and explain this sentence: " + message);
            messages.add(userMessage);

            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String rawResponse = restTemplate.postForObject(API_URL, entity, String.class);

            JsonNode root = objectMapper.readTree(rawResponse);
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            return "Error calling Groq API: " + e.getMessage();
        }
    }
}
