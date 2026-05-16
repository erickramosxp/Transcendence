let navigateFn = null;

export function registerAppNavigate(fn) {
	navigateFn = fn;
}

export function appNavigate(to, options) {
	if (typeof navigateFn === "function") {
		navigateFn(to, options);
		return;
	}
	const path = typeof to === "string" ? to : to?.pathname;
	if (path) window.location.assign(path);
}

export function navigateToNotifications() {
	appNavigate("/notifications");
}
