package com.api_spring_boot.api_spring_boot.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService,
                         UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }
@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) throws ServletException, IOException {

    String authHeader = request.getHeader("Authorization");

    if (authHeader == null) {
        System.out.println("JWT FILTER: no Authorization header");
        filterChain.doFilter(request, response);
        return;
    }

    if (!authHeader.startsWith("Bearer ")) {
        System.out.println("JWT FILTER: Authorization header not Bearer: " + authHeader);
        filterChain.doFilter(request, response);
        return;
    }

    String jwt = authHeader.substring(7);

    try {
        String userEmail = jwtService.extractUsername(jwt);
        System.out.println("JWT FILTER: extracted user=" + userEmail);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            System.out.println("JWT FILTER: authorities=" + userDetails.getAuthorities());

            boolean ok = jwtService.isTokenValid(jwt, userDetails);
            System.out.println("JWT FILTER: tokenValid=" + ok);

            if (ok) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                System.out.println("JWT FILTER: authentication set ✅");
            }
        }

    } catch (Exception e) {
        System.out.println("JWT FILTER: exception while parsing token: " + e.getMessage());
    }

    filterChain.doFilter(request, response);
}

    }
