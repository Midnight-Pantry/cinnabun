build:
	pnpm run -r build

start_ssr:
	cd apps/ssr && node dist/server

test:
	make start_ssr & pnpm run -r --parallel test
