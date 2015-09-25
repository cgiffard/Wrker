# Wrker

Wrapper around `wrk` for easier testing. Runs multiple times at different
connection counts, averages multiple tests, graphs results, and more.

![Image of wrk doing its thing in the browser...](https://files.app.net/7crqfbxo_.png)

## Installation

Wrker uses node. You'll need to install `wrk` and `node` before installing wrk:

`npm install -g wrk`

## Usage

#### Example

`wrker -i 100 -d 1 -a 3 -s 5 -r browser http://127.0.0.1:3000/`

* Run wrk for 100 iterations
	* for 1 second each
	* each iteration should be an average of three runs
* stepping up by five connections each iteration
* using the `browser` reporter
* hitting the server `http://127.0.0.1:3000/`

#### Full Guide

	Usage: wrker [options] <url...>
	
	Options:
	
	  -h, --help                output usage information
	  -V, --version             output the version number
	  -v --verbose              Verbose mode
	  -i --iterations <number>  The number of test iterations/increments to run (default 10)
	  -d --duration <number>    The duration in seconds for each test (default 5)
	  -a --averageOf <number>   The number of repeat tests to run at each stepping interval (default 3)
	  -s --stepBy <number>      The number of concurrent connections to step up by each iteration (default 10)
	  -r --reporter <value>     The reporter to use (defaults to console.) Use one of: 
								  * csv
								  * console
								  * browser (experimental)

## Notes

There are some rough edges:

* I got lazy and haven't yet written tests
* Parsing of wrk data which uses SI prefixes is not yet implemented
* The browser reporter is currently pretty basic. It doesn't currently display
  a bunch of stuff you'd definitely want from graphs: scales/axes,
  item labels and counts, comparison scatterplots, overlay latency stats on the
  same graph, and much more. **I'm getting to this.**

## Licence

Copyright (c) 2015, Christopher Giffard

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT,
OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
