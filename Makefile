.PHONY: clean

jswav.js:
	cat src/*.js >jswav.js

clean:
	rm -f jswav.js