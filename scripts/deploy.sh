#!/bin/bash

DOOGIE_HOME="/web/doogie"
DOOGIE_TEMP="/tmp/doogie"

rm -rf $DOOGIE_HOME/*
cp -R $DOOGIE_TEMP/install/doogie $DOOGIE_HOME
rm -rf $DOOGIE_TEMP

