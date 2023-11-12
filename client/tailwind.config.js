/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: "jit",
	content: [
	"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
	extend: {
		colors: {
			textWhite: "#eaebef",
			anotherbackground: "#101316",
			anotheronebackground: "#101316",
			disabled: "#101316",
			blacks: "#101316",
			redder: "#b20e1f",
			redish: "#ab212d",
			redehh: "#8c2123",
			bluer: "#62a6c4",
			bluemore: "#154c79",
			greener: "#087937",
			oranger: "#c36c35",
			yellowish: "#eeaf00"
		},
		filter: ['hover']
	},
	},
	plugins: [],
}

