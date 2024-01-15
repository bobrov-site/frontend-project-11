install:
	npm ci
fix: 
	npx eslint --fix .
lint:
	npx eslint .
serve:
	npx webpack serve