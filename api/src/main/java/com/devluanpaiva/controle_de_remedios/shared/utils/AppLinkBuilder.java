package com.devluanpaiva.controle_de_remedios.shared.utils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public final class AppLinkBuilder {
    private AppLinkBuilder() {
    }

    public static String build(String webUrl, String appPath) {
        String encodedPath = URLEncoder.encode(appPath, StandardCharsets.UTF_8);
        return webUrl + "/link?to=" + encodedPath;
    }
}
