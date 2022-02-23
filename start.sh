#!/bin/bash
node server/index.js >> log.txt &
echo $! > pid