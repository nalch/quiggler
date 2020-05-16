all: test lint docs

test: dev_reqs plain-test plain-lint

dev_reqs:
	poetry install

build_reqs:
	poetry install --no-dev

plain-test:
	poetry run pytest -n auto --cov-report term-missing --cov-report xml --junitxml test_results.xml --cov=quiggler

plain-lint:
	poetry run black --check src tests
	poetry run pydocstyle src/
	poetry run isort --recursive src/ tests
	poetry run unify -i -r src/ tests
	poetry run flake8 src/ tests
	poetry run mypy --ignore-missing-imports src/
	poetry run pytype src/

sdist: build_reqs
	poetry build

lint: dev_reqs plain-lint

docs: dev_reqs
	poetry run $(MAKE) -C docs html

shell:
	poetry run ipython

version: dev_reqs
	poetry run bumpversion $(bump)
	poetry run gitchangelog > docs/source/changelog.rst
	git add docs/source/changelog.rst && git commit --amend

clean:
	# - @rm -rf docs/build
	- @rm -rf src/*.egg-info
	- @rm -f .coverage
	- @rm -f test_results.xml
	- @rm -f coverage.xml
	- @rm -rf .mypy_cache
	- @rm -rf .pytest_cache
	- @rm -rf .pytype
	- @find ./src ./docs -name '*.pyc' | xargs -r rm
