package ai.speakflow.backend.controller;

import ai.speakflow.backend.dto.TranslateRequest;
import ai.speakflow.backend.dto.TranslateResponse;
import ai.speakflow.backend.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/translate")
@CrossOrigin(origins = "*")
public class TranslateController {

    @Autowired
    private TranslationService translationService;

    @PostMapping
    public ResponseEntity<TranslateResponse> translate(@RequestBody TranslateRequest request) {
        return ResponseEntity.ok(translationService.translate(request));
    }
}
