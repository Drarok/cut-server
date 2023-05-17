const { v4: uuidv4 } = require('uuid');

function makeDateTimeString() {
  const now = new Date();
  return now.toISOString(); // TODO: Improve this
}

class Snippet {
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
  #snippets;
  #token;

  constructor() {
    this.#snippets = [];
    this.#token = '';
  }

  async createSnippet(text) {
    this.#snippets.push(new Snippet(text));
  }

  async getSnippets(sort = SnippetServiceSortOrder.DESCENDING) {
    const snippets = [...this.#snippets];

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

    this.#snippets = [];
  }

  async getClearToken() {
    return this.#token = uuidv4();
  }
}

module.exports = new SnippetService();
