
TESTS = test/*.js
REPORTER = dot

#
# Node Module
#

node_modules: package.json
	@npm install

#
# Components
#

#
# Tests
#

test: test-node 
test-node: node_modules
	@printf "==> [Test :: Node.js]\n"
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require ./test/bootstrap \
		--reporter $(REPORTER) \
		$(TESTS)


#
# Clean up
#

clean: clean-node 

clean-node:
	@rm -rf node_modules

#
# Instructions
#

.PHONY: all
.PHONY: test test-all test-node
.PHONY: clean clean-node
