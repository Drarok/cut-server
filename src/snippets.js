const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

function makeDateTimeString() {
  const now = new Date();
  return now.toISOString(); // TODO: Improve this
}

class Snippet {
  // Don't try to use this.#linkPattern.test because RegExp objects are stupid in JS
  // and will store internal state depending which flags are in the pattern.
  #linkPattern = /\w+:\/\/[^\b\s]+/igm;

  #createdAt;
  #text;

  constructor(text) {
    this.#createdAt = makeDateTimeString();
    this.#text = text;
  }

  get createdAt() {
    return this.#createdAt;
  }

  get text() {
    return this.#text;
  }

  get html() {
    const matches = [...this.#text.matchAll(this.#linkPattern)];

    if (matches.length === 0) {
      return this.#text;
    }

    const decorateLink = text => `<a href="${text}">${text}</a>`;
    let html = this.#text;
    for (const match of matches.reverse()) {
      html = html.slice(0, match.index) +
        decorateLink(match[0]) +
        html.slice(match.index + match[0].length);
    }

    return html;
  }

  toJSON() {
    return {
      createdAt: this.#createdAt,
      text: this.#text,
    };
  }

  static fromJSON(obj) {
    const snippet = new Snippet(obj.text || '');
    snippet.#createdAt = obj.createdAt || makeDateTimeString();
    return snippet;
  }
}

function tests() {
  const assert = require('assert');

  const verifyLinks = (input, expected) => {
    if (expected === false) {
      expected = input;
    } else if (expected === true) {
      expected = `<a href="${input}">${input}</a>`;
    }

    const snippet = new Snippet(input);
    const html = snippet.html;
    assert(html === expected, `Snippet returned ${html} for expected ${expected}`);
    console.log(`Test case ${input} passed: ${html}`);
  };

  verifyLinks('Example text', false);
  verifyLinks('https://example.com', true);
  verifyLinks('https://example.com/with/path?and=query', true);
  verifyLinks('custom://my-thing', true);
  verifyLinks('custom://my-thing/with/path?and=query', true);
  verifyLinks('prefix https://www.example.com', 'prefix <a href="https://www.example.com">https://www.example.com</a>');
  verifyLinks('prefix https://www.example.com/path?and=query', 'prefix <a href="https://www.example.com/path?and=query">https://www.example.com/path?and=query</a>');
  verifyLinks('https://example.com/with/path?and=query suffix', '<a href="https://example.com/with/path?and=query">https://example.com/with/path?and=query</a> suffix');
}

if (require.main === module) {
  tests();
}

// TODO: TypeScript has real enums
class SnippetServiceSortOrder {
  static get ASCENDING() {
    return 0;
  }

  static get DESCENDING() {
    return 1;
  }
}

class SnippetService {
  #token = '';

  constructor() {
  }

  async createSnippet(text) {
    const snippets = await this.loadSnippets();
    snippets.push(new Snippet(text));
    await this.#persist(snippets);
  }

  async getSnippets(sort = SnippetServiceSortOrder.DESCENDING) {
    const snippets = await this.#loadSnippets();

    if (sort === SnippetServiceSortOrder.DESCENDING) {
      return snippets.reverse();
    } else {
      return snippets;
    }
  }

  async clearSnippets(token) {
    if (token === '' || token !== this.#token) {
      throw new Error('Invalid or expired token');
    }
    this.#token = '';

    await this.#persist([]);
  }

  async getClearToken() {
    return this.#token = uuidv4();
  }

  async #loadSnippets() {
    const pathname = __dirname + '/../data.json';
    let json;
    try {
      json = await fs.readFile(pathname, 'utf8');
    } catch (e) {
      if (e.code === 'ENOENT') {
        return;
      }

      throw e;
    }

    const parsed = JSON.parse(json);
    return parsed.map(obj => Snippet.fromJSON(obj));
  }

  async #persist(snippets) {
    const pathname = __dirname + '/../data.json';
    await fs.writeFile(pathname, JSON.stringify(snippets));
  }
}

module.exports = new SnippetService();
