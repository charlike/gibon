# parse-commit-message [![npm version][npmv-img]][npmv-url] [![License][license-img]][license-url] [![Libera Manifesto][libera-manifesto-img]][libera-manifesto-url]

> Extensible parser for git commit messages following Conventional Commits Specification

Please consider following this project's author, [Charlike Mike Reagent](https://github.com/tunnckoCore), and :star: the project to show your :heart: and support.

<div id="readme"></div>

[![Code style][codestyle-img]][codestyle-url]
[![CircleCI linux build][linuxbuild-img]][linuxbuild-url]
[![CodeCov coverage status][codecoverage-img]][codecoverage-url]
[![Renovate App Status][renovateapp-img]][renovateapp-url]
[![Make A Pull Request][prs-welcome-img]][prs-welcome-url]
[![Time Since Last Commit][last-commit-img]][last-commit-url]

<!-- [![Semantically Released][standard-release-img]][standard-release-url] -->

If you have any _how-to_ kind of questions, please read the [Contributing Guide][contributing-url] and [Code of Conduct][code_of_conduct-url] documents.
For bugs reports and feature requests, [please create an issue][open-issue-url] or ping
[@tunnckoCore](https://twitter.com/tunnckoCore) at Twitter.

[![Conventional Commits][ccommits-img]][ccommits-url]
[![Minimum Required Nodejs][nodejs-img]][npmv-url]
[![NPM Downloads Monthly][downloads-monthly-img]][npmv-url]
[![NPM Downloads Total][downloads-total-img]][npmv-url]
[![Share Love Tweet][twitter-share-img]][twitter-share-url]
[![Twitter][twitter-img]][twitter-url]

Project is [semantically](https://semver.org) versioned & automatically released from [GitHub Actions](https://github.com/features/actions) with [Lerna](https://github.com/lerna/lerna).

[![Become a Patron][patreon-img]][patreon-url]
[![Buy me a Kofi][kofi-img]][kofi-url]
[![PayPal Donation][paypal-img]][paypal-url]
[![Bitcoin Coinbase][bitcoin-img]][bitcoin-url]
[![Keybase PGP][keybase-img]][keybase-url]

| Topic                                                            |                                           Contact |
| :--------------------------------------------------------------- | ------------------------------------------------: |
| Any legal or licensing questions, like private or commerical use |           ![tunnckocore_legal][tunnckocore_legal] |
| For any critical problems and security reports                   |     ![tunnckocore_security][tunnckocore_security] |
| Consulting, professional support, personal or team training      | ![tunnckocore_consulting][tunnckocore_consulting] |
| For any questions about Open Source, partnerships and sponsoring | ![tunnckocore_opensource][tunnckocore_opensource] |

<!-- Logo when needed:

<p align="center">
  <a href="https://github.com/tunnckoCore/opensource">
    <img src="./media/logo.png" width="85%">
  </a>
</p>

-->

## Table of Contents

- [Install](#install)
  - [Exposed named methods](#exposed-named-methods)
  - [Types](#types)
- [API](#api)
  - [.applyPlugins](#applyplugins)
  - [.plugins](#plugins)
  - [.mappers](#mappers)
- [Contributing](#contributing)
  - [Guides and Community](#guides-and-community)
  - [Support the project](#support-the-project)
  - [OPEN Open Source](#open-open-source)
  - [Wonderful Contributors](#wonderful-contributors)
- [License](#license)

_(TOC generated by [verb](https://github.com/verbose/verb) using [markdown-toc](https://github.com/jonschlinkert/markdown-toc))_

## Install

This project requires [**Node.js**](https://nodejs.org) **>=10.13.0** _(see [Support & Release Policy](https://github.com/tunnckoCoreLabs/support-release-policy))_. Install it using
[**yarn**](https://yarnpkg.com) or [**npm**](https://npmjs.com).<br>
_We highly recommend to use Yarn when you think to contribute to this project._

```bash
$ yarn add parse-commit-message
```

_**TODO:** need to add support in [jest-runner-docs][] to handle multiple files in `src/`.
For now read the comments there._

### Exposed named methods

```js
export {
  // methods that accepts
  // string, array of strings, Commit and etc
  parse,
  stringify,
  validate,
  check,
  // methods only for the "header",
  // e.g. the first lien of a commit
  parseHeader,
  stringifyHeader,
  validateHeader,
  checkHeader,
  // methods that accepts only Commit type object
  parseCommit,
  stringifyCommit,
  validateCommit,
  checkCommit,
  // main
  applyPlugins,
  mappers,
  plugins,
  // utils
  stringToHeader,
  toArray,
  cleaner,
  errorMsg,
  isBreakingChange,
  isValidString,
  normalizeCommit,
};
```

### Types

```ts
export interface CommitResult {
  error?: Error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface Mention {
  index: number;
  handle: string;
  mention: string;
}

export interface HeaderType {
  type: string;
  scope?: string | null;
  subject: string;
}

export interface SimpleHeader {
  value: string;
}

export type Header = HeaderType | SimpleHeader;

export interface Commit {
  header: Header;
  body?: string | null;
  footer?: string | null;
  increment?: string | boolean;
  isBreaking?: boolean;
  mentions?: Array<Mention>;
  [key: string]: any;
}

export type PossibleCommit = string | Commit | Array<Commit>;

export type Plugin = (
  commit: Commit,
  normalize?: boolean,
) => void | {} | Commit;
export type Plugins = Plugin | Array<Plugin>;

export interface Mappers {
  mentions: Plugin;
  isBreaking: Plugin;
  isBreakingChange: Plugin;
}

export interface Options {
  caseSensitive: boolean; // default false
  normalize: boolean; // default true
  headerRegex: string | RegExp;
}
```

<!-- docks-start -->

## API

_Generated using [jest-runner-docs](https://ghub.now.sh/jest-runner-docs)._

### [.applyPlugins](./src/index.js#L99)

Apply a set of `plugins` over all of the given `commits`.
A plugin is a simple function passed with `Commit` object,
which may be returned to modify and set additional properties
to the `Commit` object.

**Signature**

```ts
function(plugins, commits, options)
```

<span id="applyplugins-params"></span>
**Params**

- `plugins` **{Plugins}** - a simple function like `(commit) => {}`
- `commits` **{PossibleCommit}** - a PossibleCommit or an array of strings; a value which should already be gone through `parse`
- `returns` **{Array&lt;Commit&gt;}** - plus the modified or added properties from each function in `plugins`

_The `commits` should be coming from `parse`, `validate` (with `ret` option)
or the `check` methods. It does not do checking and validation._

**Example**

```js
import dedent from 'dedent';
import { applyPlugins, plugins, parse, check } from './src';

const commits = [
  'fix: bar qux',
  dedent`feat(foo): yea yea

  Awesome body here with @some mentions
  resolves #123

  BREAKING CHANGE: ouch!`,
  'chore(ci): updates for ci config',
  {
    header: { type: 'fix', subject: 'Barry White' },
    body: 'okey dude',
    foo: 'possible',
  },
];

// Parses, normalizes, validates
// and applies plugins
const results = applyPlugins(plugins, check(parse(commits)));

console.log(results);
// => [ { body: null,
//   footer: null,
//   header: { scope: null, type: 'fix', subject: 'bar qux' },
//   mentions: [],
//   increment: 'patch',
//   isBreaking: false },
// { body: 'Awesome body here with @some mentions\nresolves #123',
//   footer: 'BREAKING CHANGE: ouch!',
//   header: { scope: 'foo', type: 'feat', subject: 'yea yea' },
//   mentions: [ [Object] ],
//   increment: 'major',
//   isBreaking: true },
// { body: null,
//   footer: null,
//   header:
//    { scope: 'ci', type: 'chore', subject: 'updates for ci config' },
//   mentions: [],
//   increment: false,
//   isBreaking: false },
// { body: 'okey dude',
//   footer: null,
//   header: { scope: null, type: 'fix', subject: 'Barry White' },
//   foo: 'possible',
//   mentions: [],
//   increment: 'patch',
//   isBreaking: false } ]
```

### [.plugins](./src/index.js#L183)

An array which includes `mentions` and `increment` built-in plugins.
The `mentions` is an array of objects. Basically what's returned from
the [collect-mentions][] package.

**Params**

**Example**

```js
import { plugins, applyPlugins, parse } from 'parse-commit-message';

console.log(plugins); // =>  [mentions, increment]
console.log(plugins[0]); // => [Function mentions]
console.log(plugins[0]); // => [Function increment]

const cmts = parse([
  'fix: foo @bar @qux haha',
  'feat(cli): awesome @tunnckoCore feature\n\nSuper duper baz!'
  'fix: ooh\n\nBREAKING CHANGE: some awful api change'
]);

const commits = applyPlugins(plugins, cmts);
console.log(commits);
// => [
//   {
//     header: { type: 'fix', scope: '', subject: 'foo bar baz' },
//     body: '',
//     footer: '',
//     increment: 'patch',
//     isBreaking: false,
//     mentions: [
//       { handle: '@bar', mention: 'bar', index: 8 },
//       { handle: '@qux', mention: 'qux', index: 13 },
//     ]
//   },
//   {
//     header: { type: 'feat', scope: 'cli', subject: 'awesome feature' },
//     body: 'Super duper baz!',
//     footer: '',
//     increment: 'minor',
//     isBreaking: false,
//     mentions: [
//       { handle: '@tunnckoCore', mention: 'tunnckoCore', index: 18 },
//     ]
//   },
//   {
//     header: { type: 'fix', scope: '', subject: 'ooh' },
//     body: 'BREAKING CHANGE: some awful api change',
//     footer: '',
//     increment: 'major',
//     isBreaking: true,
//     mentions: [],
//   },
// ]
```

### [.mappers](./src/index.js#L216)

An object (named set) which includes `mentions` and `increment` built-in plugins.

**Params**

**Example**

```js
import { mappers, applyPlugins, parse } from 'parse-commit-message';

console.log(mappers); // => { mentions, increment }
console.log(mappers.mentions); // => [Function mentions]
console.log(mappers.increment); // => [Function increment]

const flat = true;
const parsed = parse('fix: bar', flat);
console.log(parsed);
// => {
//   header: { type: 'feat', scope: 'cli', subject: 'awesome feature' },
//   body: 'Super duper baz!',
//   footer: '',
// }

const commit = applyPlugins([mappers.increment], parsed);
console.log(commit);
// => [{
//   header: { type: 'feat', scope: 'cli', subject: 'awesome feature' },
//   body: 'Super duper baz!',
//   footer: '',
//   increment: 'patch',
// }]
```

<!-- docks-end -->

**[back to top](#readme)**

## Contributing

### Guides and Community

Please read the [Contributing Guide][contributing-url] and [Code of Conduct][code_of_conduct-url] documents for advices.

For bug reports and feature requests, please join our [community][community-url] forum and open a thread there with prefixing the title of the thread with the name of the project if there's no separate channel for it.

Consider reading the [Support and Release Policy](https://github.com/tunnckoCoreLabs/support-release-policy) guide if you are interested in what are the supported Node.js versions and how we proceed. In short, we support latest two even-numbered Node.js release lines.

### Support the project

[Become a Partner or Sponsor?][patreon-url] :dollar: Check the **Partner**, **Sponsor** or **Omega-level** tiers! :tada: You can get your company logo, link & name on this file. It's also rendered on package page in [npmjs.com][npmv-url] and [yarnpkg.com](https://yarnpkg.com/en/package/parse-commit-message) sites too! :rocket:

Not financial support? Okey! [Pull requests](https://github.com/tunnckoCoreLabs/contributing#opening-a-pull-request), stars and all kind of [contributions](https://opensource.guide/how-to-contribute/#what-it-means-to-contribute) are always
welcome. :sparkles:

<!--
### OPEN Open Source

This project is following [OPEN Open Source](http://openopensource.org) model

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is built on collective efforts and it's not strongly guarded by its founders.

There are a few basic ground-rules for its contributors

1. Any **significant modifications** must be subject to a pull request to get feedback from other contributors.
2. [Pull requests](https://github.com/tunnckoCoreLabs/contributing#opening-a-pull-request) to get feedback are _encouraged_ for any other trivial contributions, but are not required.
3. Contributors should attempt to adhere to the prevailing code-style and development workflow.
-->

### Wonderful Contributors

Thanks to the hard work of these wonderful people this project is alive! It follows the
[all-contributors](https://github.com/kentcdodds/all-contributors) specification.
Don't hesitate to add yourself to that list if you have made any contribution! ;) [See how,
here](https://github.com/jfmengels/all-contributors-cli#usage).

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/5038030?v=4" width="120px;"/><br /><sub><b>Charlike Mike Reagent</b></sub>](https://tunnckocore.com)<br />[💻](https://github.com/tunnckoCore/opensource/commits?author=tunnckoCore "Code") [📖](https://github.com/tunnckoCore/opensource/commits?author=tunnckoCore "Documentation") [💬](#question-tunnckoCore "Answering Questions") [👀](#review-tunnckoCore "Reviewed Pull Requests") [🔍](#fundingFinding-tunnckoCore "Funding Finding") |
| :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

Consider showing your [support](#support-the-project) to them. :sparkling_heart:

**[back to top](#readme)**

## License

Copyright (c) 2018-present, [Charlike Mike Reagent](https://tunnckocore.com) `<opensource@tunnckocore.com>` & [contributors](#wonderful-contributors).<br>
Released under the [MPL-2.0 License][license-url].

[contributing-url]: https://github.com/tunnckoCore/opensource/blob/master/CONTRIBUTING.md
[code_of_conduct-url]: https://github.com/tunnckoCore/opensource/blob/master/CODE_OF_CONDUCT.md

<!-- Heading badges -->

[npmv-url]: https://www.npmjs.com/package/parse-commit-message
[npmv-img]: https://badgen.net/npm/v/parse-commit-message?icon=npm&cache=300
[license-url]: https://github.com/tunnckoCore/opensource/blob/master/packages/parse-commit-message/LICENSE
[license-img]: https://badgen.net/npm/license/parse-commit-message?cache=300
[libera-manifesto-url]: https://liberamanifesto.com
[libera-manifesto-img]: https://badgen.net/badge/libera/manifesto/grey

<!-- Front line badges -->

[codecoverage-img]: https://badgen.net/badge/coverage/65.61%25/orange?icon=codecov&cache=300
[codecoverage-url]: https://codecov.io/gh/tunnckoCore/opensource
[codestyle-url]: https://github.com/airbnb/javascript
[codestyle-img]: https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb&cache=300
[linuxbuild-url]: https://github.com/tunnckocore/opensource/actions
[linuxbuild-img]: https://badgen.net/github/checks/tunnckoCore/opensource/master?cache=300&label=build&icon=github
[ccommits-url]: https://conventionalcommits.org/
[ccommits-img]: https://badgen.net/badge/conventional%20commits/v1.0.0/green?cache=300
[standard-release-url]: https://github.com/standard-release/standard-release
[standard-release-img]: https://badgen.net/badge/semantically/released/05c5ff?cache=300
[community-img]: https://badgen.net/badge/join/community/7b16ff?cache=300
[community-url]: https://github.com/tunnckocorehq/community
[last-commit-img]: https://badgen.net/github/last-commit/tunnckoCore/opensource/master?cache=300
[last-commit-url]: https://github.com/tunnckoCore/opensource/commits/master
[nodejs-img]: https://badgen.net/badge/node/>=10.13.0/green?cache=300
[downloads-weekly-img]: https://badgen.net/npm/dw/parse-commit-message?icon=npm&cache=300
[downloads-monthly-img]: https://badgen.net/npm/dm/parse-commit-message?icon=npm&cache=300
[downloads-total-img]: https://badgen.net/npm/dt/parse-commit-message?icon=npm&cache=300
[renovateapp-url]: https://renovatebot.com
[renovateapp-img]: https://badgen.net/badge/renovate/enabled/green?cache=300
[prs-welcome-img]: https://badgen.net/badge/PRs/welcome/green?cache=300
[prs-welcome-url]: http://makeapullrequest.com

<!-- TODO: update icon -->

[paypal-url]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HYJJEZNSGAPGC&source=url
[paypal-img]: https://badgen.net/badge/PayPal/donate/003087?cache=300&icon=https://simpleicons.now.sh/paypal/fff

<!-- TODO: update icon -->

[kofi-url]: https://ko-fi.com/tunnckoCore
[kofi-img]: https://badgen.net/badge/Buy%20me/a%20coffee/29abe0c2?cache=300&icon=https://rawcdn.githack.com/tunnckoCore/badgen-icons/f8264c6414e0bec449dd86f2241d50a9b89a1203/icons/kofi.svg

<!-- TODO: update icon -->

[bitcoin-url]: https://www.blockchain.com/btc/payment_request?address=3QNHKun1K1SUui1b4Z3KEGPPsWC1TgtnqA&message=Open+Source+Software&amount_local=10&currency=USD
[bitcoin-img]: https://badgen.net/badge/Bitcoin%20tip/3QNHKun...b4Z3KEGPPsWC1TgtnqA/yellow?cache=300&icon=https://simpleicons.now.sh/bitcoin/fff
[keybase-url]: https://keybase.io/tunnckoCore
[keybase-img]: https://badgen.net/keybase/pgp/tunnckoCore?cache=300
[twitter-url]: https://twitter.com/tunnckoCore
[twitter-img]: https://badgen.net/twitter/follow/tunnckoCore?icon=twitter&color=1da1f2&cache=300
[patreon-url]: https://www.patreon.com/bePatron?u=5579781
[patreon-img]: https://badgen.net/badge/Become/a%20patron/F96854?icon=patreon

<!-- [patreon-img]: https://badgen.net/badge/Patreon/tunnckoCore/F96854?icon=patreon -->

[patreon-sponsor-img]: https://badgen.net/badge/become/a%20sponsor/F96854?icon=patreon
[twitter-share-url]: https://twitter.com/intent/tweet?text=https://github.com/tunnckoCore/opensource/tree/master&via=tunnckoCore
[twitter-share-img]: https://badgen.net/badge/twitter/share/1da1f2?icon=twitter
[open-issue-url]: https://github.com/tunnckoCore/opensource/issues/new
[tunnckocore_legal]: https://badgen.net/https/liam-badge-daknys6gadky.runkit.sh/com/legal/tunnckocore?label&color=A56016&icon=https://svgshare.com/i/Dt6.svg
[tunnckocore_consulting]: https://badgen.net/https/liam-badge-daknys6gadky.runkit.sh/com/consulting/tunnckocore?label&color=07ba96&icon=https://svgshare.com/i/Dt6.svg
[tunnckocore_security]: https://badgen.net/https/liam-badge-daknys6gadky.runkit.sh/com/security/tunnckocore?label&color=ed1848&icon=https://svgshare.com/i/Dt6.svg
[tunnckocore_opensource]: https://badgen.net/https/liam-badge-daknys6gadky.runkit.sh/com/opensource/tunnckocore?label&color=ff7a2f&icon=https://svgshare.com/i/Dt6.svg
[tunnckocore_newsletter]: https://badgen.net/https/liam-badge-daknys6gadky.runkit.sh/com/newsletter/tunnckocore?label&color=5199FF&icon=https://svgshare.com/i/Dt6.svg
[collect-mentions]: https://github.com/olstenlarck/collect-mentions
[jest-runner-docs]: https://tunnckocore.com/opensource