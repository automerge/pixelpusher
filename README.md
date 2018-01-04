# pixelpusher

![](screenshots/animation-cat.gif)

## Installation

```bash
# Install latest node. I'm using 9.2.1
brew install openssl
brew install yarn

yarn

export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
npm start
```

If you want to edit the CSS, for now, start the css watcher separately:

```bash
npm run css
```

![pixelpusher](screenshots/screenshot-cat.png)
