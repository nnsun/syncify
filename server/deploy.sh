#!/bin/sh

cd ..
git subtree push --prefix server heroku master
cd server
