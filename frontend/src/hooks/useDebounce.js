import { useState, useEffect } from "react";

/**
 * Retorna um valor que só atualiza após o usuário parar de alterar o valor original
 * pelo tempo especificado em `delay` (em milissegundos).
 * Útil para evitar chamadas excessivas à API enquanto o usuário digita.
 */
export function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => clearTimeout(handler);
	}, [value, delay]);

	return debouncedValue;
}
