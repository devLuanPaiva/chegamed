package com.devluanpaiva.controle_de_remedios.modules.ai.config;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gemini.pricing")
public class GeminiPricingProperties {
    private Map<String, ModelPricing> models = Map.of();

    public Map<String, ModelPricing> getModels() {
        return models;
    }

    public void setModels(Map<String, ModelPricing> models) {
        this.models = models;
    }

    public ModelPricing pricingFor(String model) {
        return models.get(model);
    }

    public record ModelPricing(BigDecimal inputPerMillionTokens, BigDecimal outputPerMillionTokens) {
    }
}
