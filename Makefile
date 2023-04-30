build:
	pnpm run -r build

start_ssr:
	cd apps/ssr && pnpm run dev

test:
	make start_ssr & pnpm run -r test --parallel
