"use client";

import { useEffect } from "react";

function normalizeGreekUppercase(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("el-GR");
}

function processUppercaseElement(element: Element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  let currentNode = walker.nextNode();
  while (currentNode) {
    const textNode = currentNode as Text;
    const parentTag = textNode.parentElement?.tagName;

    if (
      textNode.nodeValue?.trim() &&
      parentTag !== "SCRIPT" &&
      parentTag !== "STYLE" &&
      parentTag !== "INPUT" &&
      parentTag !== "TEXTAREA"
    ) {
      textNodes.push(textNode);
    }

    currentNode = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const original = textNode.nodeValue ?? "";
    const normalized = normalizeGreekUppercase(original);

    if (normalized !== original) {
      textNode.nodeValue = normalized;
    }
  });
}

function processAllUppercaseElements(root: ParentNode = document) {
  root.querySelectorAll(".uppercase").forEach((element) => {
    processUppercaseElement(element);
  });
}

export default function GreekUppercaseNormalizer() {
  useEffect(() => {
    processAllUppercaseElements();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData" && mutation.target.parentElement) {
          const uppercaseParent = mutation.target.parentElement.closest(".uppercase");
          if (uppercaseParent) {
            processUppercaseElement(uppercaseParent);
          }
        }

        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.classList.contains("uppercase")) {
            processUppercaseElement(node);
          }

          processAllUppercaseElements(node);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
