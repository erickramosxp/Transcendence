export const LIMITS = {
	postText: 500,
	commentText: 500,
	profileNameMin: 3,
	profileNameMax: 30,
	profileBioMax: 160,
	profileLocationMax: 100,
	chatMessageMax: 4000,
	groupNameMax: 80,
	passwordMin: 8,
	passwordMax: 30,
	avatarFileMB: 5,
	postImageFileMB: 5,
	postVideoFileMB: 20,
};

/** Converte limite em MB para bytes (upload / validFile). */
export function mbToBytes(mb) {
	return mb * 1024 * 1024;
}
