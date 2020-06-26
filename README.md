# Syncify

Syncify is a webapp for listening to Spotify with friends! Check it out at [nnsun.github.io/syncify](https://nnsun.github.io/syncify/). 

Simply create a room, have your friends join in, and everyone's playback will be synced up!

Unfortunately, because of Spotify policy, all users must have a Spotify Premium subscription.

## Project Details

The project comprises of a Node.js backend running Express.js and a Vue.js frontend. It utilizes the [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/).

### Setup

1. Install [Node.js](https://nodejs.org/en/download/) if you haven't already. This will also install npm.

2. Clone the repo.
```shell
git clone https://github.com/nnsun/syncify.git
cd syncify
```

3. Install the project's dependencies by running `npm install` for both the frontend and backend projects.

4. Run the frontend and backend on localhost with `npm start`. 
A convenient script to run everything in a tmux session is provided in the project root: `./tmux_localhost.sh`. 
The session serves both the frontend and backend in their respective panels. 
