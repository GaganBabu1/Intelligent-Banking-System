package com.banking;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnomalyControllerSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adminCanReadMockAttentionQueue() throws Exception {
        mockMvc.perform(get("/api/admin/insights/anomaly-queue")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                        .andExpect(jsonPath("$").isArray());
    }

    @Test
    void regularUserCannotReadAttentionQueue() throws Exception {
        mockMvc.perform(get("/api/admin/insights/anomaly-queue")
                        .with(user("user").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void anonymousUserCannotReadAttentionQueue() throws Exception {
        mockMvc.perform(get("/api/admin/insights/anomaly-queue"))
                .andExpect(status().isUnauthorized());
    }
}
