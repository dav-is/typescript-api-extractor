/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
 */
export function withBareUrl(value: string) {}

/**
 * @see {@link https://external.example/docs}
 */
export function withLink(value: string) {}

/**
 * @see {@link https://external.example/docs|External Docs}
 */
export function withLinkLabel(value: string) {}

/**
 * @see {@link https://external.example/docs} for further information.
 */
export function withLinkTrailing(value: string) {}

/**
 * @see SomeComponent
 */
export function withPlainRef(value: string) {}

export interface PropsWithSee {
	/**
	 * Provides a hint for autofill.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
	 */
	autoComplete?: string;
	/**
	 * The variant style.
	 * @see {@link https://external.example/docs|Style Guide}
	 */
	variant?: string;
}
