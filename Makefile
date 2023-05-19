build:
	pnpm run -r build

start_ssr:
	cd apps/ssr && pnpm run prod

test:
	make start_ssr & pnpm run -r --parallel test
