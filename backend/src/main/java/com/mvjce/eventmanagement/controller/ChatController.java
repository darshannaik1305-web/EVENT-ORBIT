package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:7070", "http://127.0.0.1:7070", "http://localhost:5173", "http://127.0.0.1:5173"})
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody(required = false) ChatRequest request) {
        if (request == null || request.getQuery() == null || request.getQuery().isBlank()) {
            return ResponseEntity.badRequest().body(new ChatResponse(
                ChatService.GROUNDED_UNAVAILABLE_MESSAGE, 
                Collections.emptyList()
            ));
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) 
                ? auth.getName() 
                : "anonymousUser";

        ChatResponse response = chatService.processQuery(request.getQuery(), username);
        return ResponseEntity.ok(response);
    }
}
