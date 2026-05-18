/**
 * Limites centralizados do frontend (texto, perfil, senha e upload).
 * Valores de upload são consumidos por `validFile.js` e espelham a validação do backend.
 *
 * @typedef {Object} Limits
 * @property {number} postText - Máximo de caracteres em post de texto (CreateText/Photo/VideoPost, CommentCard).
 * @property {number} commentText - Máximo de caracteres em comentários.
 * @property {number} profileNameMin - Tamanho mínimo de nome/username (RegisterForm, validators).
 * @property {number} profileNameMax - Tamanho máximo de nome/username.
 * @property {number} profileBioMax - Bio do perfil (EditProfileForm).
 * @property {number} profileLocationMax - Localização do perfil.
 * @property {number} chatMessageMax - Mensagem de chat (MessageInput).
 * @property {number} groupNameMax - Nome de grupo de conversa.
 * @property {number} passwordMin - Senha mínima (RegisterForm, SecurityTab).
 * @property {number} passwordMax - Senha máxima (inputs com maxLength, LoginForm, SecurityTab).
 * @property {number} avatarFileMB - Tamanho máximo do avatar em MB (`validImageFile` com kind `"avatar"`).
 * @property {number} postImageFileMB - Tamanho máximo de imagem de post em MB (`validImageFile` com kind `"image"`).
 * @property {number} postVideoFileMB - Tamanho máximo de vídeo de post em MB (`validVideoFile`).
 */
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
