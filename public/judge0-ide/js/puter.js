"use strict";

export const IS_PUTER = puter.env === "app";

export function usePuter() {
    return IS_PUTER || puter.auth.isSignedIn();
}

async function uiSignIn() {
    const signInBtn = document.getElementById("judge0-sign-in-btn");
    if (signInBtn) signInBtn.classList.add("judge0-hidden");
    const signOutBtn = document.getElementById("judge0-sign-out-btn");
    if (signOutBtn) {
    signOutBtn.classList.remove("judge0-hidden");
        const usernameEl = signOutBtn.querySelector("#judge0-puter-username");
        if (usernameEl) usernameEl.innerText = (await puter.auth.getUser()).username;
    }

    const modelSelect = document.getElementById("judge0-chat-model-select");
    if (modelSelect && modelSelect.closest(".ui.selection.dropdown")) {
    modelSelect.closest(".ui.selection.dropdown").classList.remove("disabled");
    }

    const userInput = document.getElementById("judge0-chat-user-input");
    if (userInput) {
    userInput.disabled = false;
        if (modelSelect) userInput.placeholder = `Message ${modelSelect.value}`;
    }

    const sendButton = document.getElementById("judge0-chat-send-button");
    if (sendButton) sendButton.disabled = false;
    const inlineSuggestions = document.getElementById("judge0-inline-suggestions");
    if (inlineSuggestions) inlineSuggestions.disabled = false;
}

function uiSignOut() {
    const signInBtn = document.getElementById("judge0-sign-in-btn");
    if (signInBtn) signInBtn.classList.remove("judge0-hidden");
    const signOutBtn = document.getElementById("judge0-sign-out-btn");
    if (signOutBtn) {
    signOutBtn.classList.add("judge0-hidden");
        const usernameEl = signOutBtn.querySelector("#judge0-puter-username");
        if (usernameEl) usernameEl.innerText = "Sign out";
    }

    const modelSelect = document.getElementById("judge0-chat-model-select");
    if (modelSelect && modelSelect.closest(".ui.selection.dropdown")) {
    modelSelect.closest(".ui.selection.dropdown").classList.add("disabled");
    }

    const userInput = document.getElementById("judge0-chat-user-input");
    if (userInput) {
    userInput.disabled = true;
        if (modelSelect) userInput.placeholder = `Sign in to chat with ${modelSelect.value}`;
    }

    const sendButton = document.getElementById("judge0-chat-send-button");
    if (sendButton) sendButton.disabled = true;
    const inlineSuggestions = document.getElementById("judge0-inline-suggestions");
    if (inlineSuggestions) inlineSuggestions.disabled = true;
}

function updateSignInUI() {
    if (puter.auth.isSignedIn()) {
        uiSignIn();
    } else {
        uiSignOut();
    }
}

async function signIn() {
    await puter.auth.signIn();
    updateSignInUI();
}

function signOut() {
    puter.auth.signOut();
    updateSignInUI();
}

document.addEventListener("DOMContentLoaded", function () {
    const signInBtn = document.getElementById("judge0-sign-in-btn");
    const signOutBtn = document.getElementById("judge0-sign-out-btn");
    if (signInBtn) signInBtn.addEventListener("click", signIn);
    if (signOutBtn) signOutBtn.addEventListener("click", signOut);
    updateSignInUI();
});
