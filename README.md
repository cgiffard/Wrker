# Wrker

Wrapper around `wrk` for easier testing.

## Installation

Wrker uses node. You'll need to install `wrk` and `node` before installing wrk:

`npm install -g wrk`

## Usage

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
								  * browser