import { describe, expect, it } from "vitest";
import { LIMITS } from "@/shared/validation/limits";
import {
	mbToBytes,
	isValidEmail,
	isValidHttpUrl,
	isValidLoginIdentifier,
	validateChangePassword,
	validateLogin,
	validateProfile,
	validateRegister,
} from "@/shared/validation/validators";

/** Retorna a chave i18n — suficiente para assertar qual erro foi escolhido. */
const t = (key) => key;

describe("mbToBytes", () => {
	it("converte megabytes para bytes", () => {
		expect(mbToBytes(5)).toBe(5 * 1024 * 1024);
	});
});

describe("isValidEmail", () => {
	it("aceita e-mails válidos", () => {
		expect(isValidEmail("user@example.com")).toBe(true);
		expect(isValidEmail("  user@example.com  ")).toBe(true);
	});

	it("rejeita e-mails inválidos", () => {
		expect(isValidEmail("")).toBe(false);
		expect(isValidEmail("not-an-email")).toBe(false);
		expect(isValidEmail("@example.com")).toBe(false);
	});
});

describe("isValidHttpUrl", () => {
	it("aceita vazio (campo opcional)", () => {
		expect(isValidHttpUrl("")).toBe(true);
		expect(isValidHttpUrl("   ")).toBe(true);
	});

	it("aceita http e https", () => {
		expect(isValidHttpUrl("https://example.com")).toBe(true);
		expect(isValidHttpUrl("http://example.com/path")).toBe(true);
	});

	it("rejeita protocolos inválidos ou texto sem URL", () => {
		expect(isValidHttpUrl("ftp://example.com")).toBe(false);
		expect(isValidHttpUrl("not a url")).toBe(false);
	});
});

describe("isValidLoginIdentifier", () => {
	it("aceita e-mail válido", () => {
		expect(isValidLoginIdentifier("user@example.com")).toBe(true);
	});

	it("aceita username dentro dos limites", () => {
		expect(isValidLoginIdentifier("abc")).toBe(true);
		expect(isValidLoginIdentifier("user_name123")).toBe(true);
	});

	it("rejeita vazio, username curto ou com caracteres inválidos", () => {
		expect(isValidLoginIdentifier("")).toBe(false);
		expect(isValidLoginIdentifier("ab")).toBe(false);
		expect(isValidLoginIdentifier("user-name")).toBe(false);
		expect(isValidLoginIdentifier("a".repeat(LIMITS.profileNameMax + 1))).toBe(false);
	});
});

describe("validateRegister", () => {
	const validPayload = {
		name: "Maria Silva",
		username: "maria_silva",
		email: "maria@example.com",
		password: "12345678",
		acceptTerms: true,
	};

	it("aceita payload válido", () => {
		expect(validateRegister(validPayload, t)).toEqual({ ok: true });
	});

	it("rejeita campos obrigatórios vazios", () => {
		expect(validateRegister({ ...validPayload, name: "" }, t)).toEqual({
			ok: false,
			message: "errors.fillAllFields",
		});
	});

	it("rejeita sem aceitar termos", () => {
		expect(validateRegister({ ...validPayload, acceptTerms: false }, t)).toEqual({
			ok: false,
			message: "register.acceptTermsRequired",
		});
	});

	it("rejeita nome curto", () => {
		expect(validateRegister({ ...validPayload, name: "ab" }, t)).toEqual({
			ok: false,
			message: "errors.nameTooShort",
		});
	});

	it("rejeita e-mail inválido", () => {
		expect(validateRegister({ ...validPayload, email: "invalid" }, t)).toEqual({
			ok: false,
			message: "errors.invalidEmail",
		});
	});

	it("rejeita username inválido", () => {
		expect(validateRegister({ ...validPayload, username: "ab" }, t)).toEqual({
			ok: false,
			message: "errors.invalidUsername",
		});
	});

	it("rejeita senha curta ou longa", () => {
		expect(
			validateRegister({ ...validPayload, password: "1".repeat(LIMITS.passwordMin - 1) }, t)
		).toEqual({ ok: false, message: "errors.passwordTooShort" });

		expect(
			validateRegister({ ...validPayload, password: "1".repeat(LIMITS.passwordMax + 1) }, t)
		).toEqual({ ok: false, message: "errors.passwordTooLong" });
	});
});

describe("validateLogin", () => {
	it("aceita e-mail e retorna credenciais trimadas", () => {
		expect(
			validateLogin(
				{ username: "  user@example.com  ", password: "secret123" },
				t
			)
		).toEqual({
			ok: true,
			username: "user@example.com",
			password: "secret123",
		});
	});

	it("aceita username válido", () => {
		expect(validateLogin({ username: "valid_user", password: "x" }, t)).toEqual({
			ok: true,
			username: "valid_user",
			password: "x",
		});
	});

	it("rejeita campos vazios", () => {
		expect(validateLogin({ username: "", password: "" }, t)).toEqual({
			ok: false,
			message: "errors.fillAllFields",
		});
	});

	it("rejeita identificador inválido", () => {
		expect(validateLogin({ username: "ab", password: "secret" }, t)).toEqual({
			ok: false,
			message: "errors.invalidLoginIdentifier",
		});
	});

	it("rejeita senha acima do limite", () => {
		expect(
			validateLogin(
				{ username: "user@example.com", password: "x".repeat(LIMITS.passwordMax + 1) },
				t
			)
		).toEqual({ ok: false, message: "errors.passwordTooLong" });
	});
});

describe("validateProfile", () => {
	const validProfile = {
		name: "João",
		bio: "Desenvolvedor",
		location: "Brasil",
		websiteUrl: "https://example.com",
	};

	it("aceita perfil válido e normaliza dados", () => {
		expect(
			validateProfile(
				{
					name: "  João  ",
					bio: "Desenvolvedor",
					location: "Brasil",
					websiteUrl: "  https://example.com  ",
				},
				t
			)
		).toEqual({
			ok: true,
			data: {
				name: "João",
				bio: "Desenvolvedor",
				location: "Brasil",
				websiteUrl: "https://example.com",
			},
		});
	});

	it("aceita website vazio", () => {
		expect(validateProfile({ ...validProfile, websiteUrl: "" }, t).ok).toBe(true);
	});

	it("rejeita nome curto ou longo", () => {
		expect(validateProfile({ ...validProfile, name: "ab" }, t)).toEqual({
			ok: false,
			message: "header.editProfileModal.errorNameLength",
		});

		expect(
			validateProfile({ ...validProfile, name: "a".repeat(LIMITS.profileNameMax + 1) }, t)
		).toEqual({
			ok: false,
			message: "header.editProfileModal.errorNameMaxLength",
		});
	});

	it("rejeita bio ou localização acima do limite", () => {
		expect(
			validateProfile({ ...validProfile, bio: "x".repeat(LIMITS.profileBioMax + 1) }, t)
		).toEqual({
			ok: false,
			message: "header.editProfileModal.errorBioLength",
		});

		expect(
			validateProfile(
				{ ...validProfile, location: "x".repeat(LIMITS.profileLocationMax + 1) },
				t
			)
		).toEqual({
			ok: false,
			message: "header.editProfileModal.errorLocationLength",
		});
	});

	it("rejeita URL de website inválida", () => {
		expect(validateProfile({ ...validProfile, websiteUrl: "not-a-url" }, t)).toEqual({
			ok: false,
			message: "header.editProfileModal.errorWebsiteUrl",
		});
	});
});

describe("validateChangePassword", () => {
	const validPasswords = {
		currentPassword: "oldpass12",
		newPassword: "newpass12",
		confirmNewPassword: "newpass12",
	};

	it("aceita alteração válida", () => {
		expect(validateChangePassword(validPasswords, t)).toEqual({ ok: true });
	});

	it("rejeita senha atual vazia", () => {
		expect(
			validateChangePassword({ ...validPasswords, currentPassword: "" }, t)
		).toEqual({ ok: false, message: "security.warnCurrentPassword" });
	});

	it("rejeita nova senha ou confirmação vazias", () => {
		expect(
			validateChangePassword({ ...validPasswords, newPassword: "" }, t)
		).toEqual({ ok: false, message: "security.warnNewPassword" });
	});

	it("rejeita nova senha curta ou longa", () => {
		expect(
			validateChangePassword(
				{
					...validPasswords,
					newPassword: "short",
					confirmNewPassword: "short",
				},
				t
			)
		).toEqual({ ok: false, message: "security.passwordTooShort" });

		const tooLong = "x".repeat(LIMITS.passwordMax + 1);
		expect(
			validateChangePassword(
				{ ...validPasswords, newPassword: tooLong, confirmNewPassword: tooLong },
				t
			)
		).toEqual({ ok: false, message: "auth:errors.passwordTooLong" });
	});

	it("rejeita confirmação diferente", () => {
		expect(
			validateChangePassword(
				{ ...validPasswords, confirmNewPassword: "otherpass12" },
				t
			)
		).toEqual({ ok: false, message: "security.passwordMismatch" });
	});
});
