import { Form, AI, ActionPanel, Action, popToRoot, open } from "@raycast/api";
import { useState } from "react";
import Vibrant from "node-vibrant"
import fs from "fs"

export default function Command() {
    const [nameError, setNameError] = useState();
    const [imageError, setImageError] = useState();

    function dropNameErrorIfNeeded() {
        if (nameError && nameError.length > 0) {
            setNameError(undefined);
        }
    }
    function dropImageErrorIfNeeded() {
        if (imageError && imageError.length > 0) {
            setNameError(undefined);
        }
    }

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm
                        onSubmit={async (values) => {
                            const image = values.image[0];
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

                                    // console.log(await AI.ask(`Take the following hex colors: ${Object.values(colorTypes).join()} and this file name: ${image}. Generate a suitable name for a color theme with these attributes. Only return the name. If the file name is ambiguous, use only the colors. Some examples of good color names include: "Forest", "Ocean", "Flames". Feel free to be creative, but make sure to keep it short, idealy 1 word, two words if you have to.`));

                                    let encode = (string) => {
                                        return encodeURI(string).replace("#", "%23")
                                    }

                                    open(`raycast://theme?version=1&name=${encode(values.themeName)}&appearance=light&colors=${encode(colorTypes.LightMuted)},${encode(colorTypes.LightMuted)},${encode(colorTypes.DarkVibrant)},${encode(colorTypes.LightVibrant)},${encode(colorTypes.LightVibrant)},%23F50A0A,%23F5600A,%23E0A200,%2307BA65,%230A7FF5,%23470AF5,%23F50AA3`)

                                    console.log(colorTypes);
                                })
                                .catch(error => {
                                    // Handle any errors
                                    console.error(error);
                                });

                            // console.log(file);
                            popToRoot();
                        }}
                    />
                </ActionPanel>
            }
        >
            <Form.TextField
                id="themeName"
                title="Theme Name"
                placeholder="Name your theme..."
                defaultValue="New Theme"
                error={nameError}
                onChange={dropNameErrorIfNeeded}
                onBlur={(event) => {
                    if (event.target.value?.length === 0) {
                        setNameError("Please provide a name for your theme.");
                    } else {
                        dropNameErrorIfNeeded();
                    }
                }}
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
