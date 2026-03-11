package ai.speakflow.backend.controller;

import ai.speakflow.backend.dto.ChatRequest;
import ai.speakflow.backend.dto.ChatResponse;
import ai.speakflow.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.processChatMessage(request));
    }
}
