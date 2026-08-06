package com.devluanpaiva.controle_de_remedios.modules.notification.client;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ExpoPushClient {
    private static final String EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";
    private static final int MAX_MESSAGES_PER_REQUEST = 100;
    private static final String DEFAULT_SOUND = "default";
    private static final String HIGH_PRIORITY = "high";

    private final RestClient restClient;
    private final String accessToken;
    private final boolean enabled;

    public ExpoPushClient(
            @Value("${expo.push.access-token:}") String accessToken,
            @Value("${expo.push.enabled:true}") boolean enabled) {

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());

        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
        this.accessToken = accessToken;
        this.enabled = enabled;
    }

    public void send(List<String> deviceTokens, String title, String body, Map<String, Object> data) {
        if (!enabled || deviceTokens.isEmpty()) {
            return;
        }

        for (int start = 0; start < deviceTokens.size(); start += MAX_MESSAGES_PER_REQUEST) {
            int end = Math.min(start + MAX_MESSAGES_PER_REQUEST, deviceTokens.size());
            sendBatch(deviceTokens.subList(start, end), title, body, data);
        }
    }

    private void sendBatch(List<String> deviceTokens, String title, String body, Map<String, Object> data) {
        List<ExpoPushMessage> messages = deviceTokens.stream()
                .map(token -> new ExpoPushMessage(token, title, body, data, DEFAULT_SOUND, HIGH_PRIORITY))
                .toList();

        try {
            RestClient.RequestBodySpec request = restClient.post()
                    .uri(EXPO_PUSH_API_URL)
                    .header(HttpHeaders.ACCEPT, "application/json");

            if (StringUtils.hasText(accessToken)) {
                request = request.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
            }

            request.body(messages).retrieve().toBodilessEntity();
        } catch (RestClientException ex) {
            log.warn("Falha ao enviar push notification via Expo para {} dispositivo(s)", deviceTokens.size(), ex);
        }
    }

    private record ExpoPushMessage(
            String to,
            String title,
            String body,
            Map<String, Object> data,
            String sound,
            String priority) {
    }
}
