#!/bin/bash
docker build . -t deeppen/sandbox
yes | docker image prune
