import Image from "next/image";
import { useEffect, useState } from "react";

export const ShowImage = ({ file, alt }) => {
    console.log({ file })
    const phototUrl = URL.createObjectURL(file);
    // const phototUrl = readURL(file)
    console.log({ phototUrl })
    return (
        <Image src={phototUrl}
            height={100}
            width={100}
            alt={alt}
            loading='lazy'
            objectFit="contain"
            objectPosition="center"
        />
    )
}

// function readURL(input) {
//     if (input) {
//         var reader = new FileReader();

//         reader.onload = function (e) {
//             $('#blah').attr('src', e.target.result).width(150).height(200);
//         };

//         reader.readAsDataURL(input);
//         return reader;
//     }
// }

// export const ImagePreviewShow = ({ file, alt }) => {
//     const [fileDataURL, setFileDataURL] = useState(null);

//     useEffect(() => {
//         let fileReader, isCancel = false;
//         if (file) {
//             fileReader = new FileReader();
//             fileReader.onload = (e) => {
//                 const { result } = e.target;
//                 if (result && !isCancel) {
//                     setFileDataURL($('#blah').attr('src', e.target.result).width(150).height(200));
//                     // setFileDataURL(result)
//                 }
//             }
//             fileReader.readAsDataURL(file);
//         }
//         return () => {
//             isCancel = true;
//             if (fileReader && fileReader.readyState === 1) {
//                 fileReader.abort();
//             }
//         }
//     }, [file]);
//     return (
//         // {
//             fileDataURL?
//                 <Image src = { fileDataURL }
//             height = { 150 }
//             width = { 150 }
//             alt = { alt }
//             loading = 'lazy'
//         />
//         : null
//     // }
//     )
// }