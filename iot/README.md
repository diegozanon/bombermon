# Creating bundle.js

1. Install browserify and uglifyjs

    npm install -g browserify
    npm install -g uglify-js

2. Run:

    browserify main.js | uglifyjs > bundle.js