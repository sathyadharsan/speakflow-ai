package ai.speakflow.backend.controller;

import ai.speakflow.backend.service.GroqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AIController {

    private final GroqService groqService;

    @Autowired
    public AIController(GroqService groqService) {
        this.groqService = groqService;
    }

    @GetMapping("/ai/chat")
    public String chat(@RequestParam String message) {
        return groqService.chat(message);
    }
}
