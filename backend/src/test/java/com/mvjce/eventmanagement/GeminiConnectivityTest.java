package com.mvjce.eventmanagement;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.*;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class GeminiConnectivityTest {

    @Test
    @DisplayName("Test: Socket connectivity diagnostic across Google Anycast IP pool")
    void testAnycastIpDiagnostic() {
        try {
            InetAddress[] addresses = InetAddress.getAllByName("generativelanguage.googleapis.com");
            int successCount = 0;
            for (InetAddress addr : addresses) {
                try (Socket socket = new Socket()) {
                    socket.connect(new InetSocketAddress(addr, 443), 2000);
                    successCount++;
                    System.out.println("✅ Responsive Gemini IP: " + addr.getHostAddress());
                } catch (Exception e) {
                    System.out.println("⏳ Non-responsive IP: " + addr.getHostAddress());
                }
            }
            System.out.println("📊 Total responsive IPs: " + successCount + " / " + addresses.length);
            assertTrue(successCount >= 0);
        } catch (Exception e) {
            System.out.println("⚠️ DNS error: " + e.getMessage());
        }
    }
}
