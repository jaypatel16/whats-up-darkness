/* eslint-disable max-params */
const https = require("https");

const is_less = (current_version) => ({
    than(compared) {
        return current_version < compared
    }
})

const check_new_version = (args, callback_uptodate, callback_yes, callback_no) => {
    if(args.CONSTANTS.ELECTRON_IS_DEV) {
        callback_uptodate()
        return
    }

    console.log("[LOG] checking new version...")
    https.get(args.CONSTANTS.UPDATER.URL, {
        headers: {
            "User-Agent": args.CONSTANTS.UPDATER.USER_AGENT
        }
    }, (res) => {
        let data = ""

        res.on("data", (chunk) => {
            data += chunk
        })

        res.on("end", () => {
            const [latest] = JSON.parse(data)
            if (latest.tag_name && is_less(args.CONSTANTS.APP_VERSION).than(latest.tag_name)) {
                console.log("[LOG] there is a new version of app.")
                console.log("[LOG] new version is '" + latest.tag_name + "'.")
                args.dialog.showMessageBox(null, {
                    title: "Do you want to download the new version?",
                    type: "question",
                    icon: args.CONSTANTS.IMAGES.APP,
                    buttons: [
                        "OK",
                        "Cancel"
                    ],
                    message: `Current version: ${args.CONSTANTS.APP_VERSION}\nLatest version: ${latest.tag_name}\n\n${latest.body}`
                }, (response) => {
                    if (response) {
                        callback_no()
                    } else {
                        console.log("[LOG] opening download url in browser...")
                        args.shell.openExternal(latest.html_url)
                        callback_yes()
                    }
                })
            } else {
                console.log("[LOG] app is up-to-date.")
                callback_uptodate()
            }
        })
    }).on("error", (err) => {
        console.error("[ERROR] " + err.message)
        callback_no()
    })
}

module.exports = { is_less, check_new_version }