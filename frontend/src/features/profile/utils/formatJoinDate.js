
export function formatJoinDate(dateString, locale = navigator.language) {
  return new Date(dateString).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}