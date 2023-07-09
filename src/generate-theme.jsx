import { Form, AI, ActionPanel, Action, popToRoot, open, Toast, showToast, environment } from "@raycast/api";
import { useState } from "react";
import Vibrant from "node-vibrant"
import fs from "fs"

export default function Command() {
    if (!environment.canAccess(AI)) {
        popToRoot();
        showToast({
            style: Toast.Style.Failure,
            title: "Please get Pro to use this extension."
        })
    } else {
        const [imageError, setImageError] = useState();

        function dropImageErrorIfNeeded() {
            if (imageError && imageError.length > 0) {
                setImageError(undefined);
            }
        }

        return (
            <Form
                actions={
                    <ActionPanel>
                        <Action.SubmitForm
                            onSubmit={async (values) => {
                                const image = values.image[0];
                                const light = values.theme === "light"
                                let name = values.themeName;
                                console.log(light)
                                if (!fs.existsSync(image) || !fs.lstatSync(image).isFile()) {
                                    return false;
                                }
                                await Vibrant.from(image)
                                    .getPalette()
                                    .then(async (palette) => {
                                        const colorTypes = {};

                                        for (const key in palette) {
                                            if (palette[key] && palette[key].hex) {
                                                colorTypes[key] = palette[key].hex;
                                            }
                                        }
                                        if (values.ai) {
                                            showToast({
                                                style: Toast.Style.Animated,
                                                title: "Loading AI title..."
                                            })
                                            name = await AI.ask(`Take the following hex colors: ${Object.values(colorTypes).join()},this file name: "${image}", and finally this original title: "${values.themeName}". Generate a suitable new title for a color theme with these attributes. Only return the name. If the file name or original title is ambiguous, use only the colors. Some examples of good color names include: "Mystic Forest", "Deep Ocean", "White Flames,". Feel free to be creative, but make sure to keep it short, idealy 1 word, two words or more if you really have to. Only return the name, use no quotation marks, periods, line breaks, or any special characters (including punctuation) whatsoever.`)
                                            name = name.trim()
                                        }

                                        let encode = (string) => {
                                            return encodeURI(string).replace("#", "%23")
                                        }

                                        if (light) {
                                            open(`raycast://theme?version=1&name=${encode(name) ?? "New Theme"}&appearance=light&colors=${encode(colorTypes.LightMuted)},${encode(colorTypes.LightMuted)},%23000000,${encode(colorTypes.LightVibrant)},${encode(colorTypes.LightVibrant)},%23F50A0A,%23F5600A,%23E0A200,%2307BA65,%230A7FF5,%23470AF5,%23F50AA3`)
                                        } else {
                                            open(`raycast://theme?version=1&name=${encode(name) ?? "New Theme"}&appearance=dark&colors=${encode(colorTypes.DarkMuted)},${encode(colorTypes.DarkMuted)},%23FFFFFF,${encode(colorTypes.DarkVibrant)},${encode(colorTypes.DarkVibrant)},%23F50A0A,%23F5600A,%23E0A200,%2307BA65,%230A7FF5,%23470AF5,%23F50AA3`)
                                        }

                                        showToast({
                                            style: Toast.Style.Success,
                                            title: "Theme Generated"
                                        })
                                    })
                                    .catch(error => {
                                        // Handle any errors
                                        console.error(error);

                                        showToast({
                                            style: Toast.Style.Failure,
                                            title: "Failed to Generate Theme"
                                        })
                                    });
                                popToRoot();
                            }}
                        />
                    </ActionPanel>
                }
            >
                <Form.Description
                    title="Theme Name"
                    text='Theme name is optional. If you choose AI Title, Raycast AI will generate a Title for you. Otherwise, it will simply be called "New Theme"'
                />
                <Form.TextField
                    id="themeName"
                    title="Theme Name"
                    placeholder="Name your theme..."
                    defaultValue="New Theme"
                />
                <Form.FilePicker
                    id="image"
                    title="Image"
                    allowMultipleSelection={false}
                    error={imageError}
                    onChange={dropImageErrorIfNeeded}
                    onBlur={(event) => {
                        console.log(event.target.value)
                        if (event.target.value?.length === 0) {
                            setImageError("Please choose an image to use.");
                        } else {
                            dropImageErrorIfNeeded();
                        }
                    }}
                />
                <Form.Separator />
                <Form.Description
                    title="Theme Type"
                    text="Depending on your choice, Colorify will either create a darker theme, or a lighter-colored theme."
                />
                <Form.Dropdown id="theme" defaultValue="dark">
                    <Form.Dropdown.Item value="light" title="Light Theme" />
                    <Form.Dropdown.Item value="dark" title="Dark Theme" />
                </Form.Dropdown>
                <Form.Description
                    title="AI Title"
                    text="Using Raycast AI, Colorify takes your current title, your colors, and more to generate a beautifully named Theme."
                />
                <Form.Checkbox id="ai" label="Enhance your theme title with AI" defaultValue={false} />
            </Form>
        );
    }
}
