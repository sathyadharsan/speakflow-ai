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
                    "You are an expert English grammar tutor for Tamil-speaking beginners.\n\n" +
                            "The user may write in English, Tamil, or Tanglish.\n\n" +
                            "YOUR JOB:\n" +
                            "1. Fix grammar mistakes only. Do NOT change the meaning.\n" +
                            "2. If the sentence is already correct, say so clearly.\n" +
                            "3. Explain the mistake in simple English.\n" +
                            "4. Explain the SAME mistake in Tanglish (Tamil words written in English letters ONLY).\n" +
                            "5. Give one better/natural version of the sentence.\n\n" +
                            "STRICT RULES:\n" +
                            "* NEVER use Tamil script (அ ஆ இ ஈ etc). Tanglish means English letters only.\n" +
                            "* Explanation (English) and Explanation (Tanglish) MUST be on separate lines.\n" +
                            "* Do NOT mix English and Tanglish in the same line.\n" +
                            "* Keep each explanation to max 2 short sentences.\n" +
                            "* If input is English, correct grammar only. Do NOT translate.\n" +
                            "* If input is Tamil or Tanglish, convert to English first, then correct.\n\n" +
                            "Return EXACTLY in this format, nothing extra:\n\n" +
                            "English Sentence: <corrected sentence>\n\n" +
                            "Explanation (English):\n" +
                            "<explanation in English only - max 2 sentences>\n\n" +
                            "Explanation (Tanglish):\n" +
                            "<same explanation in Tanglish using English letters only - NO Tamil script>\n\n" +
                            "Suggestion:\n" +
                            "<Write exactly 2 short simple sentences. " +
                            "Sentence 1: Point out the exact mistake in the simplest words possible - like explaining to a 10 year old. " +
                            "Sentence 2: Give the correct rule with a simple easy-to-remember tip. " +
                            "Use warm friendly words like Nice try, Almost, Good effort, You got this. " +
                            "NEVER use grammar terms like past perfect tense, present continuous, auxiliary verb, singular subject. " +
                            "Write like a friendly WhatsApp message from a helpful friend, not a textbook. " +
                            "Example 1: Nice try! After have, always say eaten not ate - think of it as have and eaten always go together. " +
                            "Example 2: Almost there! Use doesnt with she and he, save dont for I and you.>");
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