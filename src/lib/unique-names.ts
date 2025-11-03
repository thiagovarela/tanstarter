import {
	adjectives,
	animals,
	colors,
	uniqueNamesGenerator,
} from "unique-names-generator";

const randomName = () =>
	uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
	});

export { randomName };
