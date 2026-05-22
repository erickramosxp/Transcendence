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

        String bodyText = buildBody(safeTitle, safeDescription);
        bodyText = truncate(bodyText, budgetForBody);
        if (bodyText.isBlank()) {
            return truncate(safeUrl, MAX_POST_LENGTH);
        }

        return bodyText + linkSuffix;
    }

    private static String buildBody(String title, String description) {
        if (title.isBlank()) {
            return description;
        }
        if (description.isBlank()) {
            return title;
        }

        String summary = stripDuplicateTitlePrefix(title, description);
        if (summary.isBlank()) {
            return ensureSentenceEnd(title);
        }

        return ensureSentenceEnd(title) + " " + summary;
    }

    /** Garante ponto final no título antes do corpo (o feed colapsa \\n em espaço). */
    private static String ensureSentenceEnd(String text) {
        if (text.isBlank()) {
            return text;
        }
        char last = text.charAt(text.length() - 1);
        if (last == '.' || last == '!' || last == '?' || last == '…') {
            return text;
        }
        return text + ".";
    }

    private static String stripDuplicateTitlePrefix(String title, String description) {
        if (title.isBlank() || description.isBlank()) {
            return description;
        }
        if (description.regionMatches(true, 0, title, 0, title.length())) {
            String remainder = description.substring(title.length()).trim();
            if (!remainder.isEmpty() && (remainder.charAt(0) == '.' || remainder.charAt(0) == ':' || remainder.charAt(0) == '-')) {
                remainder = remainder.substring(1).trim();
            }
            return remainder;
        }
        return description;
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
