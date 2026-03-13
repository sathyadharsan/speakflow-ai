package ai.speakflow.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${speakflow.jwt.secret}")
    private String jwtSecret;

    @Value("${speakflow.jwt.access.expiration}")
    private int jwtAccessExpirationMs;

    @Value("${speakflow.jwt.refresh.expiration}")
    private int jwtRefreshExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal.getUsername(), jwtAccessExpirationMs);
    }

    public String generateAccessTokenFromEmail(String email) {
        return generateToken(email, jwtAccessExpirationMs);
    }

    public String generateRefreshToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal.getUsername(), jwtRefreshExpirationMs);
    }

    private String generateToken(String subject, int expirationMs) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public org.springframework.http.ResponseCookie generateRefreshCookie(String refreshToken) {
        return org.springframework.http.ResponseCookie.from("refreshToken", refreshToken)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    public String getRefreshTokenFromCookies(jakarta.servlet.http.HttpServletRequest request) {
        jakarta.servlet.http.Cookie cookie = org.springframework.web.util.WebUtils.getCookie(request, "refreshToken");
        return (cookie != null) ? cookie.getValue() : null;
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Log error
        }
        return false;
    }
}
