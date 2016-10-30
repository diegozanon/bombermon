# Creating bundle.js

On Win, run: .\node_modules\.bin\webpack .

On macOS or Linux, run: ./node_modules/.bin/webpack .

## Notes

There is a bug when bundling the crypto module. It throws the error "_crypto is undefined" when executed. To fix, open the bundle.js file and add "var" before the first _crypto occurence.

Another strange error: replace the block ",e.exports=function(e){if(_crypto.getRandomValues)" by ";e.exports=function(e){if(_crypto.getRandomValues)". The issue is the starting "," that should be a ";". 