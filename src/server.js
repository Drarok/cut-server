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

app.all('/', async (req, res) => {
  const resetToken = req.body.reset || '';
  const text = req.body.text || '';
  let error = '';

  if (resetToken) {
    try {
      await snippetsService.clearSnippets(resetToken);
    } catch (e) {
      error = e.message;
    }
  }

  if (text) {
    console.log(['Received:', text, ''].join('\n'));
    await snippetsService.createSnippet(text);
  }

  const snippets = snippetsService.getSnippets();
  const clearToken = snippetsService.getClearToken();

  res.render('home', {
    text,
    error,
    snippets: await snippets,
    clearToken: await clearToken,
  });
});

module.exports = app;
