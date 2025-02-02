/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { RestAPI } from "@webpack/common";

let isControlPressed = false;
let isAltPressed = false;

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Control") isControlPressed = true;
    if (e.key === "Alt") isAltPressed = true;
};

const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Control") isControlPressed = false;
    if (e.key === "Alt") isAltPressed = false;
};

export default definePlugin({
    name: "FastMute",
    description: "Fast mute with ctrl+left on user and unmute with alt+left",
    authors: [{ name: "paskal404", id: 1011780514736263168n }],
    patches: [
        {
            find: "userPopoutOpen:!this.state.",
            replacement: {
                match: /this\.setState\(\{\s*userPopoutOpen:\s*!this\.state\.userPopoutOpen\s*\}\)/,
                replace: "$self.schedule(this)"
            }
        }
    ],

    schedule(cb: any) {
        if (!isControlPressed && !isAltPressed) {
            cb.setState({
                userPopoutOpen: !cb.state.userPopoutOpen
            });
            return;
        }

        const mute = isControlPressed ? true : isAltPressed ? false : null;
        if (mute !== null) {
            if (mute === cb.props.serverMute) return;

            // console.log(`Sending request to ${mute ? "mute" : "unmute"} ${cb.props.user.username}`);
            RestAPI.patch({
                url: `/guilds/${cb.props.channel.guild_id}/members/${cb.props.user.id}`,
                body: { mute }
            });
        }
    },

    start() {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
    },

    stop() {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
    }
});
