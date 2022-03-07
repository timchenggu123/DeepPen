#!/bin/bash
docker build . -t torch/test
docker image prune
