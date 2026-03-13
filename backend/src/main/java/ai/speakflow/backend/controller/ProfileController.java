package ai.speakflow.backend.controller;

import ai.speakflow.backend.dto.ProfileUpdateRequest;
import ai.speakflow.backend.dto.MessageResponse;
import ai.speakflow.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PutMapping
    public ResponseEntity<MessageResponse> updateProfile(@RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }
}
