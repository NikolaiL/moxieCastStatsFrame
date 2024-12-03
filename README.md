# 🖼️ frames-v2-demo

A Farcaster Frames v2 demo app.

[🛠️ Frame Playground](https://warpcast.com/~/developers/frame-playground) (Mobile only)<br/>
[📦 Frame SDK](https://github.com/farcasterxyz/frames/)<br/>
[👀 Dev preview docs](https://github.com/farcasterxyz/frames/wiki/frames-v2-developer-playground-preview)<br/>

## Getting Started

This is a [NextJS](https://nextjs.org/) + TypeScript + React app.

To install dependencies:

```bash
$ yarn
```

To run the app:

```bash
$ yarn dev
```

To try your app in the Warpcast playground, you'll want to use a tunneling tool like [ngrok](https://ngrok.com/).



OK, we're all set up! Now is a good time to try out our frames app in the developer playground. To do so, we'll use ngrok to access our local dev server over the internet.

First, run the dev server:

```bash
$ yarn dev
```

Next, start ngrok:

```bash
$ ngrok http http://localhost:3000
```

Now open the Frame Playground on Warpcast mobile, by visiting [https://warpcast.com/~/developers/frame-playground](https://warpcast.com/~/developers/frame-playground).

Enter your ngrok URL and tap "Launch" to open your app.
