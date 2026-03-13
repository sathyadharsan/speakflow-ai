package ai.speakflow.backend.service;

import ai.speakflow.backend.dto.ProfileUpdateRequest;
import ai.speakflow.backend.dto.MessageResponse;
import ai.speakflow.backend.entity.User;
import ai.speakflow.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    public MessageResponse updateProfile(ProfileUpdateRequest request) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getLearningGoal() != null) user.setLearningGoal(request.getLearningGoal());

        userRepository.save(user);
        return new MessageResponse("Profile updated successfully");
    }
}
