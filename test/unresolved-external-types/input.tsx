/**
 * Tests that qualified type references (like React.ComponentType) that TypeScript
 * cannot resolve are treated as external types. This happens when external type
 * definitions aren't loaded in the program.
 *
 * The key behavior being tested:
 * - `ExternalLib.SomeType` should become an ExternalTypeNode when ExternalLib isn't loaded
 * - Local qualified names like `LocalNamespace.Type` should NOT be treated as external
 */

// This simulates a reference to an external library that isn't loaded
// TypeScript won't be able to resolve `ExternalLib.SomeType`
interface PropsWithUnresolvedExternal {
	/**
	 * A prop using an unresolved external qualified type
	 */
	// @ts-expect-error - intentionally unresolved external type for testing
	externalProp?: ExternalLib.SomeType;
	/**
	 * Another unresolved external with generic
	 */
	// @ts-expect-error - intentionally unresolved external type for testing
	externalGeneric?: ExternalLib.Container<string>;
}

// Local namespace for comparison - these SHOULD be resolved
namespace LocalNamespace {
	export interface LocalType {
		value: string;
	}
}

interface PropsWithLocalNamespace {
	/**
	 * A prop using a local qualified type - should be resolved, not external
	 */
	localProp?: LocalNamespace.LocalType;
}

// @ts-expect-error - intentionally unresolved external type for testing
export function ComponentWithUnresolvedExternal(props: PropsWithUnresolvedExternal): JSX.Element {
	return <div />;
}

// @ts-expect-error - intentionally unresolved external type for testing
export function ComponentWithLocalNamespace(props: PropsWithLocalNamespace): JSX.Element {
	return <div />;
}
