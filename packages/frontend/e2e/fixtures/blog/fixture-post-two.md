---
title: 'A second test fixture post for the related notes'
description: 'This second fixture exists only so the end-to-end tests can check the related notes block. It is not real content and never ships.'
slug: fixture-post-two
date: 2026-11-15
tags: [testing]
sources:
  - url: https://example.com/one
    title: Example source one
  - url: https://example.com/two
    title: Example source two
  - url: https://example.com/three
    title: Example source three
---

This is a second test fixture. It shares a tag with the first fixture so the first one lists it under "More notes".

## Why there are two fixtures

With one post there is nothing to relate, so the related block would never render in CI.
