const fs = require('fs').promises;
const path = require('path');

const express = require('express');
var bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.static('./web'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

const snippetsService = require('./snippets');

app.post('/', async (req, res) => {
  const resetToken = req.body.reset || '';
  const text = req.body.text || '';
  let error = '';

  if (resetToken) {
    try {
      await snippetsService.clearSnippets(resetToken);
    } catch (e) {
      // TODO: This is really brittle.
      app.locals.error = e.message;
    }
  }

  if (text) {
    console.log(['Received:', text, ''].join('\n'));
    await snippetsService.createSnippet(text);
  }

  res.redirect(303, '/');
});

app.get('/', async (req, res) => {
  const snippets = snippetsService.getSnippets();
  const clearToken = snippetsService.getClearToken();

  // TODO: This is really brittle.
  const { error } = app.locals;
  app.locals.error = '';

  res.render('home', {
    error,
    snippets: await snippets,
    clearToken: await clearToken,
  });
});

module.exports = app;
