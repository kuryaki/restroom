REPORTER := spec
MOCHA := mocha \
				--require should \
				--reporter $(REPORTER) \
				--ui bdd \
				--timeout 10000 \
		test/*/*.js

test:
	@NODE_ENV=test $(MOCHA)

.PHONY: test