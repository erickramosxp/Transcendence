import { LIMITS } from "@/shared/validation/limits";

/**
 * Converte limite em MB para bytes.
 * Usado por `validFile.js` para comparar `file.size` com `LIMITS.*FileMB`.
 *
 * @param {number} mb - Tamanho em megabytes (ex.: `LIMITS.avatarFileMB`).
 * @returns {number} Tamanho equivalente em bytes.
 */
export function mbToBytes(mb) {
	return mb * 1024 * 1024;
}

/**
 * Valida URL opcional de perfil (http/https). Não relacionado a upload de arquivo.
 */
export function isValidHttpUrl(value) {
	if (!value?.trim()) return true;
	try {
		const u = new URL(value.trim());
		return u.protocol === "http:" || u.protocol === "https:";
	} catch {
		return false;
	}
}

/**
 * Validação do formulário de registro (namespace `auth`).
 */
export function validateRegister({ name, username, email, password, acceptTerms }, t) {
	const n = name?.trim() ?? "";
	const u = username?.trim() ?? "";
	const e = email?.trim() ?? "";

	if (!n || !u || !e || !password) {
		return { ok: false, message: t("errors.fillAllFields") };
	}

	if (!acceptTerms) {
		return { ok: false, message: t("register.acceptTermsRequired") };
	}

	if (n.length < LIMITS.profileNameMin) {
		return { ok: false, message: t("errors.nameTooShort") };
	}

	if (!isValidEmail(e)) {
		return { ok: false, message: t("errors.invalidEmail") };
	}

	const usernameRegex = new RegExp(
		`^[a-zA-Z0-9_]{${LIMITS.profileNameMin},${LIMITS.profileNameMax}}$`
	);
	if (!usernameRegex.test(u)) {
		return { ok: false, message: t("errors.invalidUsername") };
	}

	if (password.length < LIMITS.passwordMin) {
		return { ok: false, message: t("errors.passwordTooShort") };
	}

	if (password.length > LIMITS.passwordMax) {
		return { ok: false, message: t("errors.passwordTooLong") };
	}

	return { ok: true };
}

export function isValidEmail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Aceita e-mail ou username (`LIMITS.profileNameMin`–`profileNameMax`).
 */
export function isValidLoginIdentifier(value) {
	const trimmed = value?.trim() ?? "";
	if (!trimmed) return false;
	if (isValidEmail(trimmed)) return true;
	const usernameRegex = new RegExp(
		`^[a-zA-Z0-9_]{${LIMITS.profileNameMin},${LIMITS.profileNameMax}}$`
	);
	return usernameRegex.test(trimmed);
}

/**
 * Validação do formulário de login (namespace `auth`).
 * @returns {{ ok: true, username: string, password: string } | { ok: false, message: string }}
 */
export function validateLogin({ username, password }, t) {
	const trimmedUsername = username?.trim() ?? "";

	if (!trimmedUsername || !password) {
		return { ok: false, message: t("errors.fillAllFields") };
	}

	if (!isValidLoginIdentifier(trimmedUsername)) {
		return { ok: false, message: t("errors.invalidLoginIdentifier") };
	}

	if (password.length > LIMITS.passwordMax) {
		return { ok: false, message: t("errors.passwordTooLong") };
	}

	return { ok: true, username: trimmedUsername, password };
}

/**
 * Validação do formulário de edição de perfil (namespace `profile`).
 * @returns {{ ok: true, data: { name: string, bio: string, location: string, websiteUrl: string } } | { ok: false, message: string }}
 */
export function validateProfile({ name, bio, location, websiteUrl }, t) {
	const trimmedName = name?.trim() ?? "";
	const trimmedWebsiteUrl = websiteUrl?.trim() ?? "";
	const bioValue = bio ?? "";
	const locationValue = location ?? "";

	if (trimmedName.length < LIMITS.profileNameMin) {
		return { ok: false, message: t("header.editProfileModal.errorNameLength") };
	}

	if (trimmedName.length > LIMITS.profileNameMax) {
		return { ok: false, message: t("header.editProfileModal.errorNameMaxLength") };
	}

	if (bioValue.length > LIMITS.profileBioMax) {
		return { ok: false, message: t("header.editProfileModal.errorBioLength") };
	}

	if (locationValue.length > LIMITS.profileLocationMax) {
		return { ok: false, message: t("header.editProfileModal.errorLocationLength") };
	}

	if (trimmedWebsiteUrl && !isValidHttpUrl(trimmedWebsiteUrl)) {
		return { ok: false, message: t("header.editProfileModal.errorWebsiteUrl") };
	}

	return {
		ok: true,
		data: {
			name: trimmedName,
			bio: bioValue,
			location: locationValue,
			websiteUrl: trimmedWebsiteUrl,
		},
	};
}

/**
 * Validação da alteração de senha (namespaces `settings` + `auth` no `t`).
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateChangePassword(
	{ currentPassword, newPassword, confirmNewPassword },
	t
) {
	if (!currentPassword) {
		return { ok: false, message: t("security.warnCurrentPassword") };
	}

	if (!newPassword || !confirmNewPassword) {
		return { ok: false, message: t("security.warnNewPassword") };
	}

	if (newPassword.length < LIMITS.passwordMin) {
		return { ok: false, message: t("security.passwordTooShort") };
	}

	if (newPassword.length > LIMITS.passwordMax) {
		return { ok: false, message: t("auth:errors.passwordTooLong") };
	}

	if (newPassword !== confirmNewPassword) {
		return { ok: false, message: t("security.passwordMismatch") };
	}

	return { ok: true };
}
