package ai.speakflow.backend.service;

import ai.speakflow.backend.dto.external.DeepSeekRequest;
import ai.speakflow.backend.dto.external.DeepSeekResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
public class AIService {

    @Value("${groq.api.key}")
    private String apiKey;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, String> analyzeSentence(String sentence) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        // Groq is OpenAI compatible, so we can reuse the DeepSeekRequest structure
        DeepSeekRequest request = DeepSeekRequest.builder()
                .model("llama-3.1-8b-instant")
                .messages(Arrays.asList(
                        DeepSeekRequest.Message.builder()
                                .role("system")
                                .content(
                                        "You are an expert English tutor for beginners. The user may write in English, Tamil, or Tanglish. Your job is to correct the sentence and explain the grammar mistake clearly.\n\n"
                                                +
                                                "Follow these rules strictly:\n" +
                                                "1. Convert the sentence into correct natural English.\n" +
                                                "2. Provide a grammar explanation in English.\n" +
                                                "3. Provide the same explanation in Tanglish (Tamil written using English letters).\n"
                                                +
                                                "4. Provide a better English sentence suggestion.\n\n" +
                                                "IMPORTANT RULES:\n" +
                                                "* The English explanation and Tanglish explanation must be in separate sections.\n"
                                                +
                                                "* Do NOT write \"English:\" or \"Tanglish:\" inside the explanation text.\n"
                                                +
                                                "* Do NOT combine the explanations.\n" +
                                                "* Do NOT include Tamil script.\n" +
                                                "* Keep explanations short and simple and easy to understand.\n\n" +
                                                "Return the response EXACTLY in this structure:\n\n" +
                                                "English Sentence: <correct English sentence>\n\n" +
                                                "Explanation (English): <short explanation in English>\n\n" +
                                                "Explanation (Tanglish): <same explanation written in Tanglish>\n\n" +
                                                "Suggestion: <better English sentence>")
                                .build(),
                        DeepSeekRequest.Message.builder()
                                .role("user")
                                .content("Correct and explain this sentence: " + sentence)
                                .build()))
                .build();

        HttpEntity<DeepSeekRequest> entity = new HttpEntity<>(request, headers);

        try {
            DeepSeekResponse response = restTemplate.postForObject(GROQ_API_URL, entity, DeepSeekResponse.class);
            if (response != null && !response.getChoices().isEmpty()) {
                String content = response.getChoices().get(0).getMessage().getContent();
                return parseAIResponse(content);
            }
        } catch (Exception e) {
            System.err.println("Groq API Error: " + e.getMessage());
        }

        return getMockResponse(sentence);
    }

    private Map<String, String> parseAIResponse(String content) {
        Map<String, String> result = new HashMap<>();
        String corrected = "";
        String englishExpl = "";
        String tanglishExpl = "";
        String suggestion = "";

        String lowerContent = content.toLowerCase();

        // Extract English Sentence
        int englishStart = lowerContent.indexOf("english sentence:");
        if (englishStart != -1) {
            int start = content.indexOf(":", englishStart) + 1;
            int end = lowerContent.indexOf("explanation (english):", start);
            if (end == -1)
                end = lowerContent.indexOf("explanation (tanglish):", start);
            if (end == -1)
                end = lowerContent.indexOf("suggestion:", start);
            if (end == -1)
                end = content.length();
            corrected = content.substring(start, end).trim();
        }

        // Extract English Explanation
        int englishExplStart = lowerContent.indexOf("explanation (english):");
        if (englishExplStart != -1) {
            int start = content.indexOf(":", englishExplStart) + 1;
            int end = lowerContent.indexOf("explanation (tanglish):", start);
            if (end == -1)
                end = lowerContent.indexOf("suggestion:", start);
            if (end == -1)
                end = content.length();
            englishExpl = content.substring(start, end).trim();
        }

        // Extract Tanglish Explanation
        int tanglishStart = lowerContent.indexOf("explanation (tanglish):");
        if (tanglishStart != -1) {
            int start = content.indexOf(":", tanglishStart) + 1;
            int end = lowerContent.indexOf("suggestion:", start);
            if (end == -1)
                end = content.length();
            tanglishExpl = content.substring(start, end).trim();
        }

        // Extract Suggestion
        int suggestionStart = lowerContent.indexOf("suggestion:");
        if (suggestionStart != -1) {
            int start = content.indexOf(":", suggestionStart) + 1;
            suggestion = content.substring(start).trim();
        }

        result.put("corrected", corrected.replace("\"", ""));
        result.put("better", suggestion.replace("\"", ""));

        StringBuilder sb = new StringBuilder();
        if (!englishExpl.isEmpty())
            sb.append("English: ").append(englishExpl).append("\n\n");
        if (!tanglishExpl.isEmpty())
            sb.append("Tanglish: ").append(tanglishExpl);
        result.put("explanation", sb.toString().trim());

        // fallback if everything is empty
        if (corrected.isEmpty() && content.length() > 0) {
            result.put("corrected", content.split("\n")[0]);
        }

        return result;
    }

    private Map<String, String> getMockResponse(String sentence) {
        Map<String, String> mock = new HashMap<>();
        mock.put("corrected", sentence);
        mock.put("explanation", "Could not connect to AI service. Showing original.");
        mock.put("better", sentence);
        return mock;
    }
}
