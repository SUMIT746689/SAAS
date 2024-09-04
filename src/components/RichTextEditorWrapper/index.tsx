import { Grid } from "@mui/material";
// import { Editor } from "@tinymce/tinymce-react";
import React, { useMemo } from "react";
// import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dynamic from "next/dynamic";

// export function RichTextEditorWrapper({value,handleChange}) {

//   return (
//     <>
//       <Editor
//         // apiKey="y7gnmtbsaxnjbgh3405ioqbdm24eit5f0ovek49w8yvq5r9q"
//         initialValue=""
//         init={{
//           init_instance_callback:(e)=>{e.setContent(value)},
//           branding: false,
//           height: 400,
//           width: '100%',
//           menubar: true,
//           plugins:
//             "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
//           toolbar:
//             "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | link image media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
//           image_advtab: true
//         }}
//         value={ value}
//         onEditorChange={handleChange}
//       />

//       {
//         // parse(data)
//         // ReactDOMServer.renderToString(React.createElement(data))
//       }
//     </>
//   )
// }

export function RichTextEditorWrapper({ height = "auto", value, handleChange }) {
  const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), []);

  return (
    <Grid item width={"100%"} >
      <ReactQuill theme="snow" value={value} onChange={handleChange} style={{ height }} />
    </Grid>
  )
}


// const modules = {
//   toolbar: [
//     //[{ 'font': [] }],
//     [{ header: [1, 2, false] }],
//     ["bold", "italic", "underline", "strike", "blockquote"],
//     [
//       { list: "ordered" },
//       { list: "bullet" },
//       { indent: "-1" },
//       { indent: "+1" },
//     ],
//     ["link", "image"],
//     [{ align: [] }, { color: [] }, { background: [] }], // dropdown with defaults from theme
//     ["clean"],
//   ],
// };

// const formats = [
//   //'font',
//   "header",
//   "bold",
//   "italic",
//   "underline",
//   "strike",
//   "blockquote",
//   "list",
//   "bullet",
//   "indent",
//   "link",
//   "image",
//   "align",
//   "color",
//   "background",
// ];

// export function RichTextEditorWrapperQuill() {
//   const [value, setValue] = useState("");
//   console.log({value})
//   const handleChange = (content, delta, source, editor) => {
//     console.log(editor.getHTML()); // html 사용시
//     // console.log(JSON.stringify(editor.getContents())); // delta 사용시
//     setValue(editor.getHTML());
//   };

//   return (
//     <Grid container height={650}>
//       <ReactQuill
//         style={{ height: "600px" }}
//         theme="snow"
//         modules={modules}
//         formats={formats}
//         value={value}
//         onChange={handleChange}
//       />
//     </Grid>
//   );
// }


