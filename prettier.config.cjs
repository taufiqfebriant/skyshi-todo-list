/** @type {import("prettier").Config} */
module.exports = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	arrowParens: 'avoid',
	plugins: [require('prettier-plugin-tailwindcss')]
};
