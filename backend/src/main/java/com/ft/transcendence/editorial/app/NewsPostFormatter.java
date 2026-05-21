package com.ft.transcendence.editorial.app;

public final class NewsPostFormatter {

    private static final int MAX_POST_LENGTH = 500;
    private static final String LINK_PREFIX = "\n\n🔗 ";

    private NewsPostFormatter() {
    }

    public static String format(String title, String description, String articleUrl) {
        String safeTitle = normalize(title);
        String safeUrl = normalize(articleUrl);
        String safeDescription = normalize(description);

        if (safeTitle.isBlank() && safeUrl.isBlank()) {
            return "";
        }

        if (safeUrl.isBlank()) {
            return truncate(safeTitle, MAX_POST_LENGTH);
        }

        String linkSuffix = LINK_PREFIX + safeUrl;
        int budgetForBody = MAX_POST_LENGTH - linkSuffix.length();

        if (budgetForBody <= 0) {
            return truncate(safeUrl, MAX_POST_LENGTH);
        }

        StringBuilder body = new StringBuilder();
        if (!safeTitle.isBlank()) {
            body.append(safeTitle);
        }

        if (!safeDescription.isBlank()) {
            if (!body.isEmpty()) {
                body.append("\n\n");
            }
            body.append(safeDescription);
        }

        String bodyText = truncate(body.toString(), budgetForBody);
        if (bodyText.isBlank()) {
            return truncate(safeUrl, MAX_POST_LENGTH);
        }

        return bodyText + linkSuffix;
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\s+", " ").trim();
    }

    private static String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value == null ? "" : value;
        }
        if (maxLength <= 3) {
            return value.substring(0, maxLength);
        }
        return value.substring(0, maxLength - 3) + "...";
    }
}
