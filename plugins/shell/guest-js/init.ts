// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { invoke } from '@tauri-apps/api/core'

const discordReg = /https?:\/\/(?:[a-z]+\.)?(?:discord\.com|discordapp\.com)(?:\/.*)?/g

function sameOrigin(a: string, b: string) {
  const uA = new URL(stripDiscordSubdomain(a))
  const uB = new URL(stripDiscordSubdomain(b))
  return uA.origin === uB.origin
}

function stripDiscordSubdomain(link: string) {
  // If this isn't a discord link, just return the link
  if (!link.match(discordReg)) return link

  return link.replace(/canary\.|ptb\.|www\./g, '')
}

function linkHandler(e: MouseEvent) {
  // Only if middle or left click
  if (e.button !== 0 && e.button !== 1) return

  let target: HTMLElement | null = e.target as HTMLElement
  while (target) {
    if (target.matches('a')) {
      const t = target as HTMLAnchorElement
      if (
        t.href !== ''
        && ['http://', 'https://', 'mailto:', 'tel:'].some((v) =>
          t.href.startsWith(v)
        )
        && t.target === '_blank'
        && !sameOrigin(t.href, window.location.href)
      ) {
        void invoke('plugin:shell|open', {
          path: t.href
        })
        e.preventDefault()
      }
      break
    }
    target = target.parentElement
  }
}

// open <a href="..."> links with the API
function openLinks(): void {
  document.querySelector('body')?.addEventListener('click', linkHandler)
  document.querySelector('body')?.addEventListener('auxclick', linkHandler)
}

// @ts-expect-error shuddup
if (window.top === window.self && !window.__SHELL_OPEN__) {
  // @ts-expect-error shuddup
  window.__SHELL_OPEN__ = true

  if (
    document.readyState === 'complete'
    || document.readyState === 'interactive'
  ) {
    openLinks()
  } else {
    window.addEventListener('DOMContentLoaded', openLinks, true)
  }
}
