# appc-app-preview-cli-hook
An appcelerator cli hook for deploying builds to appcelerator app preview

A titanium cli hook for deploying builds to [App Preview](https://labs.appcelerator.com/project/55c3ae617ed7bbfaa7e80d30/App-Preview), based on [ti-installr-hook](https://github.com/amitkothari/ti-installr-hook)

## Installation

[![NPM](https://nodei.co/npm/appc-app-preview-cli-hook.png)](https://nodei.co/npm/appc-app-preview-cli-hook/)

~~~
$ npm install -g appc-app-preview-cli-hook --unsafe-perm
~~~

You need `--unsafe-perm` to auto-install the hook.

## Usage

Use the `--app-preview` flag with the appcelerator cli to upload to app preview. For example:

~~~
$ appc run -p ios -T dist-adhoc --app-preview
~~~

Set release notes using `--release-notes` flag. For example:

~~~
$ appc run -p ios -T dist-adhoc --app-preview --release-notes='New build with awesome features'
~~~

You can invite testers by email address using the `--invite` flag. For example:

~~~
$ appc run -p ios -T dist-adhoc --app-preview --invite=jeffb@geeksinc.com.au,devices@gameshape.com
~~~

You can also set if you want to notify and add teams that have previously been invites to the app using `--notify` and `--add` flags. 'add' will give the team access, but they will not get an email.  For example:

~~~
$ appc run -p ios -T dist-adhoc --app-preview --release-notes='New build' --notify='Devs,QA' --add='Legal'
~~~

**If not set, you will be prompted for release notes and notify flag**

### Thanks to

- [dbankier](https://github.com/dbankier) for  [ti-testflight-hook](https://github.com/dbankier/ti-testflight-hook) and [Amit Kothari](https://github.com/amitkothari) for [ti-installr-hook](https://github.com/amitkothari/ti-installr-hook)


### Licence
Licensed under the [MIT License](http://opensource.org/licenses/MIT)
