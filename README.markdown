# Cut! — a snippet server

In my day job I need to move snippets of code around between machines a lot; usernames, session IDs, URLs, etc. This simple web interface allows me to submit on one device, load it on another, and copy it there.

WARNING — there is currently no storage implemented, this is in-memory only! If you restart the server or your computer, it's gone!

## Getting Started

```shell
git clone <this repo> cut
cd cut
npm install
npm run start
```

You can specify the HTTP port to start on via the `PORT` environment variable.
