build:
	pnpm run -r build

start_ssr:
	cd sandbox/ssr && pnpm run dev

test:
	make start_ssr & pnpm run -r --parallel test
