import { describe, expect, it } from 'vitest';
import { mapItemsWithAuthorName } from '../profileAuthorSync';

describe('mapItemsWithAuthorName', () => {
	it('atualiza posts do autor correspondente', () => {
		const posts = [
			{ id: 1, username: 'ana', name: 'Ana Antiga' },
			{ id: 2, username: 'bob', name: 'Bob' },
		];

		const result = mapItemsWithAuthorName(posts, 'ana', 'Ana Nova');

		expect(result).toEqual([
			{ id: 1, username: 'ana', name: 'Ana Nova' },
			{ id: 2, username: 'bob', name: 'Bob' },
		]);
	});

	it('retorna a mesma referência quando nada muda', () => {
		const posts = [{ id: 1, username: 'ana', name: 'Ana' }];
		expect(mapItemsWithAuthorName(posts, 'ana', 'Ana')).toBe(posts);
	});
});
