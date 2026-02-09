import ts from 'typescript';
import { Documentation, DocumentationTag } from '../models';

export function getDocumentationFromSymbol(
	symbol: ts.Symbol | undefined,
	checker: ts.TypeChecker,
): Documentation | undefined {
	if (!symbol) {
		return undefined;
	}

	const decl = symbol.getDeclarations();
	if (decl) {
		return getDocumentationFromNode(decl[0]);
	}

	const comment = ts.displayPartsToString(symbol.getDocumentationComment(checker));
	return comment ? new Documentation(comment) : undefined;
}

export function getDocumentationFromNode(node: ts.Node): Documentation | undefined {
	const comments = ts.getJSDocCommentsAndTags(node);
	if (comments && comments.length === 1) {
		const commentNode = comments[0];
		if (ts.isJSDoc(commentNode)) {
			const tags = commentNode.tags
				?.filter(
					(tag) =>
						!['default', 'private', 'internal', 'public', 'param'].includes(tag.tagName.text),
				)
				.map(parseTag);

			return new Documentation(
				commentNode.comment as string | undefined,
				commentNode.tags?.find((t) => t.tagName.text === 'default')?.comment,
				getVisibilityFromJSDoc(commentNode),
				tags ?? [],
			);
		}
	}
}

function getVisibilityFromJSDoc(doc: ts.JSDoc): Documentation['visibility'] | undefined {
	if (doc.tags?.some((tag) => tag.tagName.text === 'public')) {
		return 'public';
	}

	if (doc.tags?.some((tag) => tag.tagName.text === 'internal')) {
		return 'internal';
	}

	if (doc.tags?.some((tag) => tag.tagName.text === 'private')) {
		return 'private';
	}

	return undefined;
}

/**
 * Convert a JSDoc tag comment to a plain string.
 *
 * TypeScript represents comments as either a plain string or a NodeArray of
 * JSDocText / JSDocLink / JSDocLinkCode / JSDocLinkPlain nodes (the latter
 * when the comment contains inline `{@link …}` tags).  This helper
 * reconstructs the original text in both cases so downstream consumers see
 * the full value.
 */
function commentToString(
	comment: string | ts.NodeArray<ts.JSDocComment> | undefined,
): string | undefined {
	if (typeof comment === 'string') {
		return comment;
	}
	if (!comment) {
		return undefined;
	}
	const parts: string[] = [];
	for (const part of comment) {
		if (ts.isJSDocLink(part) || ts.isJSDocLinkCode(part) || ts.isJSDocLinkPlain(part)) {
			const tag =
				ts.isJSDocLink(part) ? 'link' : ts.isJSDocLinkCode(part) ? 'linkcode' : 'linkplain';
			const linkName = part.name ? part.name.getText() : '';
			const linkText = part.text || '';
			parts.push(`{@${tag} ${linkName}${linkText}}`);
		} else {
			parts.push(part.text);
		}
	}
	return parts.join('') || undefined;
}

function parseTag(tag: ts.JSDocTag): DocumentationTag {
	if (ts.isJSDocTypeTag(tag)) {
		return {
			name: tag.tagName.text,
			value: tag.typeExpression?.type.getText(),
		};
	}

	// TypeScript parses `@see` tags specially: for `@see https://example.com`,
	// the parser treats `https` as a JSDocNameReference (tag.name) and
	// `://example.com` as the comment.  Reconstruct the full value by
	// prepending the name text when present.
	if (ts.isJSDocSeeTag(tag)) {
		const nameText = tag.name ? tag.name.name.getText() : '';
		const comment = commentToString(tag.comment) ?? '';
		const value = nameText + comment;
		return {
			name: tag.tagName.text,
			value: value || undefined,
		};
	}

	return {
		name: tag.tagName.text,
		value: commentToString(tag.comment),
	};
}
