package com.devluanpaiva.controle_de_remedios_test.unit.modules.ai.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.ConfigurationPropertySources;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;

import com.devluanpaiva.controle_de_remedios.modules.ai.config.GeminiPricingProperties;

class GeminiPricingPropertiesTest {

    @Test
    void shouldBindPricingForEveryModelNameConfiguredInApplicationYml() throws Exception {
        List<PropertySource<?>> loaded = new YamlPropertySourceLoader()
                .load("application", new ClassPathResource("application.yml"));

        MutablePropertySources propertySources = new MutablePropertySources();
        loaded.forEach(propertySources::addLast);

        Binder binder = new Binder(ConfigurationPropertySources.from(propertySources));
        GeminiPricingProperties properties = binder
                .bind("gemini.pricing", Bindable.of(GeminiPricingProperties.class))
                .orElseGet(GeminiPricingProperties::new);

        assertThat(properties.pricingFor("gemini-3.1-flash-lite")).isNotNull();
        assertThat(properties.pricingFor("gemini-3.5-flash")).isNotNull();
    }
}
