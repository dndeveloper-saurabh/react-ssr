import React from "react";
import $ from "jquery";
import { v4 as uuidv4 } from "uuid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import Resizer from "react-image-file-resizer";
import { uploadBase64urlImage } from "../../../database";

const resizePicture = (file) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      1000,
      1000,
      "JPEG",
      75,
      0,
      (uri) => resolve(uri),
      "file"
    );
  });

const RichTextEditor = ({ handler, placeholder, value }) => {
  let selected_images_url = [];

  const richTextHandler = (_content, _delta, _source, editor) => {
    handler(editor);
  };

  async function imageHandler() {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", "multiple");
    input.click();
    input.onchange = async function () {
      for (let i = 0; i < input.files.length; i++) {
        // -> show uploading image
        const topSection = document.createElement("div");

        topSection.className = "uploading-image-overlay";

        topSection.innerHTML = `
        <div className="field" id="searchform">
        <p>Uploading ${input.files.length} ${
          input.files.length > 1 ? "Images" : "Image"
        }...</p>
        </div>`;

        document
          .querySelector("div > div.ql-container.ql-snow")
          .appendChild(topSection);

        const file = input.files[i];
        const compressedFile = await resizePicture(file);
        var path = `doubts/images/${uuidv4()}${file.ext}`;

        const url = await uploadBase64urlImage(compressedFile, path);

        const range = this.quill.getSelection();
        const link = url;

        // saving new file path which is uploaded
        selected_images_url.push({ path: path, url: url });

        try {
          this.quill.setSelection(range.index + 1);
        } catch (error) {}

        this.quill.insertEmbed(range?.index, "image", link);

        //remove uploading image
        try {
          $(".uploading-image-overlay").remove();
        } catch (error) {}
      }
    }.bind(this);
    // react thing
  }

  const modules = React.useMemo(
    () => ({
      syntax: false,
      toolbar: {
        handlers: {
          image: imageHandler,
        },
        container: [
          ["bold", "italic", "link"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "image"],
          [{ script: "sub" }, { script: "super" }],
        ],
      },
    }),
    []
  );

  var formats = [
    "size",
    "bold",
    "italic",
    "underline",
    "blockquote",
    "list",
    "link",
    "bullet",
    "image",
    "script",
  ];

  let quillEditor = (
    <ReactQuill
      placeholder={placeholder}
      theme="snow"
      className="updating"
      onChange={richTextHandler}
      formats={formats}
      modules={modules}
      defaultValue={value}
    />
  );

  return <div className="new-post-text-editor">{quillEditor}</div>;
};

export default RichTextEditor;
