import { LIMITS } from "@/shared/validation/limits";

export function isValidHttpUrl(value) {
	if (!value?.trim()) return true;
	try {
	  const u = new URL(value.trim());
	  return u.protocol === 'http:' || u.protocol === 'https:';
	} catch {
	  return false;
	}
  }

  export function validateRegister({ name, username, email, password, acceptTerms }, t) {
	const n = name?.trim() ?? '';
	const u = username?.trim() ?? '';
	const e = email?.trim() ?? '';

	if (!n || !u || !e || !password)
	  return { ok: false, message: t('errors.fillAllFields') };

	if (!acceptTerms)
	  return { ok: false, message: t('register.acceptTermsRequired') };

	if (n.length < LIMITS.profileNameMin)
	  return { ok: false, message: t('errors.nameTooShort') };

	if (!isValidEmail(e))
	  return { ok: false, message: t('errors.invalidEmail') };

	const usernameRegex = new RegExp(
	  `^[a-zA-Z0-9_]{${LIMITS.profileNameMin},${LIMITS.profileNameMax}}$`
	);
	if (!usernameRegex.test(u))
	  return { ok: false, message: t('errors.invalidUsername') };

	if (password.length < LIMITS.passwordMin)
	  return { ok: false, message: t('errors.passwordTooShort') };

	if (password.length > LIMITS.passwordMax)
	  return { ok: false, message: t('errors.passwordTooLong') };

	return { ok: true };
  }

  export function isValidEmail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  export function isValidLoginIdentifier(value) {
	const trimmed = value?.trim() ?? "";
	if (!trimmed) return false;
	if (isValidEmail(trimmed)) return true;
	const usernameRegex = new RegExp(
	  `^[a-zA-Z0-9_]{${LIMITS.profileNameMin},${LIMITS.profileNameMax}}$`
	);
	return usernameRegex.test(trimmed);
  }
