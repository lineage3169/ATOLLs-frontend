# Install

## Install node.Js
* Only install once
* Download and install [Node.Js](https://nodejs.org/en/)
* Open windows cmd
    * `node -v`
* If install success you can see the version

## Install vue cli
* Only install once
* Open windows cmd
* `npm install -g @vue/cli`
* `vue --version`
* If install success you can see the version

## Project setup
* Switch to `ATOLL-Insurance/frontend`
* Install packages
```
npm install
```

## Develop
* Setting
    * Open `src\store.js`
    * `var DEBUG = true`
    * Change backendUrl (if you want)
    * Save file
```
npm run serve
```
* If API blocked by cors
    * Check the backend open the debug mode
    * Try to link website and allow browse
        * Example : `https://192.168.8.8:8008/`
    * Check backend ATOLL/setting.py `DEBUG = true`
    * Try again, post something to API

## Compiles and minifies for production
* Setting
    * Open `src\store.js`
    * `var DEBUG = false`
    * Change API ip
    * Save file
```
npm run build
```
* Build success will create folder `dist`
* Then backend / sever can use this folder


# Package.json scripts

## e2e Test
```
npm run test
```
* cypress e2e-test
* setting `cypress.json`
* test file path `tests/e2e/specs/test.js`

## EsLint
```
npm run lint
```
* setting `.eslintrc.js` & `.editorconfig`

## Stylelint
```
npm run lint-css
```
* setting `.stylelintrc.json`

# Package.json
* All dependencies packages
* The packages version
* Install package
    * npm install `package name` --save
    * --save will save to package.json
* Uninstall package
    * npm uninstall `package name` --save
    * --save will save to package.json

