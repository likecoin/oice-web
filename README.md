# oice Front End (Website + Editor)

![oice](https://oice.lakoo.com/static/img/oice-logo-color-106x40.svg)

## Installation

After cloning the repository, install dependencies:

```bash
$ npm install
```

### Development

Run a development server with live-reloading at http://localhost:3000:

```bash
$ npm start
```

Options:
```bash
# PORT: Listen port
# SRV_ENV: Server config
$ PORT=8080 SRV_ENV=kubernetes npm start
```

### Deployment

Build the project and start the server at http://localhost:3000:
```bash
$ SRV_ENV=kubernetes npm run deploy
# OR
$ SRV_ENV=kubernetes npm run build
$ SRV_ENV=kubernetes npm run server
```
