.PHONY: clean

jswav.js:
	coffee -c src
	cat src/*.js >jswav.js
	rm src/*.js

clean:
	rm jswav.js