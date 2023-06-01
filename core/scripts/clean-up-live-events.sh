#!/bin/bash

find $1 -type f -mmin +20 -exec rm {} +