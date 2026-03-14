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

    private static final Map<String, String> TANGLISH_DICT = new HashMap<>();
    static {
        TANGLISH_DICT.put("saptiya", "சாப்பிட்டாயா");
        TANGLISH_DICT.put("saptiya da", "சாப்பிட்டாயா டா");
        TANGLISH_DICT.put("varala", "வரவில்லை");
        TANGLISH_DICT.put("kilambala", "கிளம்பவில்லை");
        TANGLISH_DICT.put("pathingala", "பார்த்தீர்களா");
        TANGLISH_DICT.put("pathiya", "பார்த்தாயா");
        TANGLISH_DICT.put("na sapta", "நான் சாப்பிட்டேன்");
        TANGLISH_DICT.put("naan varala", "நான் வரவில்லை");
        TANGLISH_DICT.put("na kilambala", "நான் கிளம்பவில்லை");
    }

    public TranslateResponse translate(TranslateRequest request) {
        if (request == null || request.getText() == null || request.getText().trim().isEmpty()) {
            return TranslateResponse.builder()
                    .english("Please provide text to translate.")
                    .build();
        }

        String inputText = request.getText().trim().toLowerCase();

        try {
            String trimmedKey = apiKey != null ? apiKey.trim().replace("\"", "").replace("'", "") : "";
            if (trimmedKey.isEmpty() || trimmedKey.contains("REPLACE_WITH_ACTUAL_KEY")) {
                return TranslateResponse.builder()
                        .english("Error: API Key is not configured correctly.")
                        .build();
            }

            // Step 1: Normalize Tanglish (Dictionary check first)
            String tamilScript = TANGLISH_DICT.get(inputText);
            if (tamilScript == null) {
                tamilScript = convertToTamilScript(inputText, trimmedKey);
            }
            
            if ("Translation failed".equals(tamilScript)) throw new RuntimeException("Stage 1 failed");
            
            // Step 2: Translate Tamil Script -> English
            String englishTranslation = translateTamilToEnglish(tamilScript, trimmedKey);
            if ("Translation failed".equals(englishTranslation)) throw new RuntimeException("Stage 2 failed");

            // Logging for debugging
            System.out.println("--- Translation Flow ---");
            System.out.println("Tanglish Input: " + inputText);
            System.out.println("Tamil Normalized: " + tamilScript);
            System.out.println("English Output: " + englishTranslation);
            System.out.println("------------------------");

            return TranslateResponse.builder()
                    .tanglish(inputText)
                    .tamil(tamilScript)
                    .english(englishTranslation)
                    .build();

        } catch (Exception e) {
            System.err.println("Translation Flow Error: " + e.getMessage());
            return TranslateResponse.builder()
                    .english("Translation failed")
                    .build();
        }
    }

    private String convertToTamilScript(String text, String key) throws Exception {
        String systemPrompt = "You are an expert linguist specializing in converting Tanglish (Tamil written using English letters) into correct Tamil sentences.\n\n" +
                              "Tanglish often contains spelling variations, slang, and informal grammar. Your task is to understand the intended meaning and convert it into natural spoken Tamil.\n\n" +
                              "Rules:\n" +
                              "- Understand the meaning of the Tanglish sentence.\n" +
                              "- Convert it into natural conversational Tamil.\n" +
                              "- Handle spelling variations (example: panra / pantra / pandra → பண்ண்ற).\n" +
                              "- Do NOT translate into English.\n" +
                              "- Do NOT explain anything.\n" +
                              "- Return ONLY the Tamil sentence.\n\n" +
                              "Examples:\n\n" +
                              "saptiya da → சாப்பிட்டாயா டா\n" +
                              "ena da panra → என்ன டா பண்ண்ற?\n" +
                              "enna panra → என்ன பண்ண்ற?\n" +
                              "naan varala → நான் வரவில்லை\n" +
                              "na kilambala → நான் கிளம்பவில்லை\n" +
                              "neenga pathingala → நீங்கள் பார்த்தீர்களா\n" +
                              "thunkalaya → தூங்கலையா\n" +
                              "thoongalaya → தூங்கலையா\n" +
                              "nee enga pora → நீ எங்க போற?\n" +
                              "naan ippo office ku poren → நான் இப்போது அலுவலகத்திற்கு போகிறேன்";
        
        return callGroqApi(systemPrompt, "Sentence: " + text, key);
    }

    private String translateTamilToEnglish(String tamilText, String key) throws Exception {
        String systemPrompt = "You are a Tamil-English (Tanglish) expert translator. " +
                              "Tanglish means Tamil spoken words written in English letters. " +
                              "Translate the EXACT MEANING into natural English. " +
                              "Do NOT correct grammar. Do NOT add extra meaning. Translate ONLY.\n\n" +
                              "EXAMPLES (learn the pattern):\n" +
                              "Input: nalaiku pakalam → Output: We can do it tomorrow.\n" +
                              "Input: naan romba tired → Output: I am very tired.\n" +
                              "Input: avanga varala → Output: They didn't come.\n" +
                              "Input: enna panra → Output: What are you doing?\n" +
                              "Input: saptiya → Output: Did you eat?\n" +
                              "Input: konjam wait panu → Output: Wait a little.\n\n" +
                              "Now translate this Tanglish to English. Return ONLY the translation, nothing else.";
        
        return callGroqApi(systemPrompt, "Sentence: " + tamilText, key);
    }

    private String callGroqApi(String systemContent, String userContent, String key) throws Exception {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + key);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.1-8b-instant");
            requestBody.put("temperature", 0.1);
            requestBody.put("max_tokens", 60);

            List<Map<String, String>> messages = new ArrayList<>();
            
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemContent);
            messages.add(systemMessage);

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", userContent);
            messages.add(userMessage);

            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String rawResponse = restTemplate.postForObject(API_URL, entity, String.class);

            if (rawResponse == null) return "Translation failed";

            JsonNode root = objectMapper.readTree(rawResponse);
            if (root.has("choices") && root.path("choices").size() > 0) {
                return root.path("choices").get(0).path("message").path("content").asText().trim();
            }
        } catch (Exception e) {
            System.err.println("Groq API Call Error: " + e.getMessage());
        }
        return "Translation failed";
    }
}
