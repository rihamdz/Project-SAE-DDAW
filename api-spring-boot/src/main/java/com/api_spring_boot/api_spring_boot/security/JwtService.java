package com.api_spring_boot.api_spring_boot.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    // Mets une vraie clé longue ensuite (min 32 chars)
    private final Key key = Keys.hmacShaKeyFor(
            "CHANGE_ME_TO_A_LONG_SECRET_KEY_32_BYTES_MIN".getBytes()
    );

    public String generateToken(String subject, Map<String, Object> claims) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subject)          // email
                .addClaims(claims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + 1000L * 60 * 60 * 24)) // 24h
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ utilisé par JwtAuthFilter
    public String extractUsername(String token) {
        return parse(token).getSubject();
    }

    // ✅ utilisé par JwtAuthFilter
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            Claims claims = parse(token);
            String username = claims.getSubject();
            Date expiration = claims.getExpiration();

            return username != null
                    && username.equals(userDetails.getUsername())
                    && expiration != null
                    && expiration.after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
