quiggler
=======================

> quiggler

Usage
-----

Installation
************
1. Install the package::

    pip install quiggler


Development
-----------

Makefile
********

This project uses a Makefile for various tasks. Some of the available tasks
are listed below.

* `make clean` - Clean build artifacts out of your project
* `make test` - Run Tests
* `make plain-test` - Run Tests without rebuilding the project
* `make sdist` - Build a Python source distribution
* `make docs` - Build the Sphinx documentation
* `make lint` - Get a codestyle report about your code
* `make plain-lint` - Get a codestyle report without rebuilding the project
* `make` - Equivalent to `make test lint docs sdist`

Commits
*******

Commits should group the type between features and fixes and depict this in the commit message::

    git commit -m "feat: fancy feature"
    git commit -m "fix: fancier bugfix"

Those are used to generate the changelog when creating a new version.

Versioning
**********

Versioning is done with the utility `bump2version` and started via the Makefile::

    make version bump=(major|minor|patch)
