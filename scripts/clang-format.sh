#!/bin/bash

# -------------------------------------------------------------------------------------- #
#    _  _ ____ _  _ ___  ____                                                            #
#    |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform          #
#    | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando      #
#                                                                                        #
# -------------------------------------------------------------------------------------- #

# SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
# SPDX-License-Identifier: MIT

# Exit the script when one command fails.
set -e

# Go to the repo root.
cd "$( cd "$( dirname "$0" )" && pwd )/.." || \
  { echo "ERROR: Could not find the repo root."; exit 1; }

# Execute clang format for all *.js files.
find . -type f -name '*.js' -exec sh -c '
  for file do
    echo "Formatting $file..."
    clang-format -i "$file"
  done
' sh {} +
