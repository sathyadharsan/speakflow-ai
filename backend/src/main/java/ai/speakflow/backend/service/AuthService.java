package ai.speakflow.backend.service;

import ai.speakflow.backend.dto.*;
import ai.speakflow.backend.entity.User;
import ai.speakflow.backend.repository.UserRepository;
import ai.speakflow.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public MessageResponse signup(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = User.builder()
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .password(encoder.encode(signupRequest.getPassword()))
                .build();

        userRepository.save(user);
        return new MessageResponse("User registered successfully");
    }

    public org.springframework.http.ResponseEntity<LoginResponse> login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            String accessToken = jwtUtils.generateAccessToken(authentication);
            String refreshToken = jwtUtils.generateRefreshToken(authentication);
            
            org.springframework.http.ResponseCookie refreshCookie = jwtUtils.generateRefreshCookie(refreshToken);

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Error: User record not found after authentication"));

            LoginResponse body = LoginResponse.builder()
                    .token(accessToken)
                    .user(LoginResponse.UserDto.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .build())
                    .build();
            
            return org.springframework.http.ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(body);
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public org.springframework.http.ResponseEntity<?> refresh(jakarta.servlet.http.HttpServletRequest request) {
        String refreshToken = jwtUtils.getRefreshTokenFromCookies(request);
        
        if (refreshToken != null && jwtUtils.validateJwtToken(refreshToken)) {
            String email = jwtUtils.getUserNameFromJwtToken(refreshToken);
            String newAccessToken = jwtUtils.generateAccessTokenFromEmail(email);
            
            return org.springframework.http.ResponseEntity.ok(new TokenRefreshResponse(newAccessToken, "Bearer"));
        }
        
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Refresh token is invalid or expired"));
    }
}
