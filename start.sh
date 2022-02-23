#!/bin/bash
npm start >> log.txt &
echo $! > pid