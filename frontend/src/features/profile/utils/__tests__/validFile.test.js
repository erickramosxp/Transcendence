import { describe, expect, it } from "vitest";
import { LIMITS } from "@/shared/validation/limits";
import { mbToBytes } from "@/shared/validation/validators";
import {
	fileSizeBytes,
	validImageFile,
	validVideoFile,
} from "@/features/profile/utils/validFile";

function createFile({ name = "photo.jpg", type = "image/jpeg", sizeBytes = 1024 }) {
	const buffer = new Uint8Array(sizeBytes);
	return new File([buffer], name, { type });
}

describe("fileSizeBytes", () => {
	it("espelha LIMITS em bytes", () => {
		expect(fileSizeBytes.avatar).toBe(mbToBytes(LIMITS.avatarFileMB));
		expect(fileSizeBytes.image).toBe(mbToBytes(LIMITS.postImageFileMB));
		expect(fileSizeBytes.video).toBe(mbToBytes(LIMITS.postVideoFileMB));
	});
});

describe("validImageFile", () => {
	it("rejeita ausência de arquivo", () => {
		expect(validImageFile(null).valid).toBe(false);
		expect(validImageFile(undefined).valid).toBe(false);
	});

	it("rejeita MIME inválido", () => {
		const file = createFile({ type: "application/pdf" });
		expect(validImageFile(file).valid).toBe(false);
	});

	it("aceita JPEG, PNG, WebP e GIF dentro do limite", () => {
		for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
			const file = createFile({ type, sizeBytes: 1000 });
			expect(validImageFile(file, "image").valid).toBe(true);
		}
	});

	it("rejeita imagem acima do limite de post", () => {
		const file = createFile({
			type: "image/jpeg",
			sizeBytes: fileSizeBytes.image + 1,
		});
		expect(validImageFile(file, "image").valid).toBe(false);
	});

	it("rejeita avatar acima do limite", () => {
		const file = createFile({
			type: "image/jpeg",
			sizeBytes: fileSizeBytes.avatar + 1,
		});
		expect(validImageFile(file, "avatar").valid).toBe(false);
	});
});

describe("validVideoFile", () => {
	it("rejeita ausência de arquivo", () => {
		expect(validVideoFile(null).valid).toBe(false);
	});

	it("rejeita MIME que não seja mp4", () => {
		const file = createFile({ name: "clip.avi", type: "video/avi" });
		expect(validVideoFile(file).valid).toBe(false);
	});

	it("aceita mp4 dentro do limite", () => {
		const file = createFile({
			name: "clip.mp4",
			type: "video/mp4",
			sizeBytes: 1000,
		});
		expect(validVideoFile(file).valid).toBe(true);
	});

	it("rejeita vídeo acima do limite", () => {
		const file = createFile({
			name: "clip.mp4",
			type: "video/mp4",
			sizeBytes: fileSizeBytes.video + 1,
		});
		expect(validVideoFile(file).valid).toBe(false);
	});
});
