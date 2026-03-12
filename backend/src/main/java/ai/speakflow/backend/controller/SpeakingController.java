package ai.speakflow.backend.controller;

import ai.speakflow.backend.dto.*;
import ai.speakflow.backend.service.SpeakingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/speaking")
public class SpeakingController {

    @Autowired
    private SpeakingService speakingService;

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyze(@RequestBody AnalyzeRequest request) {
        return ResponseEntity.ok(speakingService.analyze(request));
    }
}
