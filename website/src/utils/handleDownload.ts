export const downloadFile = async (url) => {
    await fetch(url, {
        mode: 'no-cors',
    }).then(res => console.log({ res }))
}

// export const downloadFile = async (url) => {
//     fetch(url, {
//         mode: 'no-cors',
//     })
//         .then(response => {
//             console.log(response)
//             return response.blob()
//         })
//         .then(blob => {
//             console.log({ blob })
//             let blobUrl = window.URL.createObjectURL(blob);
//             let a = document.createElement('a');
//             a.download = url.replace(/^.*[\\\/]/, '');
//             a.href = blobUrl;
//             document.body.appendChild(a);
//             a.click();
//             a.remove();
//         })
// }


// .then(resp => resp.blob())
// .then(blob => {
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.style.display = "none";
//     a.href = url;
//     // the filename you want
//     // a.download = "todo-1.json";
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     alert("your file has downloaded!"); // or you know, something with better UX...
// })
// .catch(() => alert("oh no!"));


// .then(response => response.blob())
// .then(blob => {
//     let blobUrl = window.URL.createObjectURL(blob);
//     let a = document.createElement('a');
//     a.download = url.replace(/^.*[\\\/]/, '');
//     a.href = blobUrl;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
// })


// export async function fetchAndDownloadFile(url) {
//     const response = await fetch(url, {
//         mode: 'no-cors',
//     });
//     console.log({ response })
//     if (!response.ok) {
//         return alert('Network response was not ok');
//     }

//     const reader = response.body.getReader();
//     const chunks = [];
//     let receivedLength = 0;

//     while (true) {
//         const { done, value } = await reader.read();
//         if (done) {
//             break;
//         }
//         chunks.push(value);
//         receivedLength += value.length;
//     }

//     // Combine chunks into a single Uint8Array
//     let combinedChunks = new Uint8Array(receivedLength);
//     let position = 0;
//     for (let chunk of chunks) {
//         combinedChunks.set(chunk, position);
//         position += chunk.length;
//     }

//     // Create a Blob from the combined chunks
//     const blob = new Blob([combinedChunks]);

//     // Create a link element and set the download attribute
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'downloaded_file'; // Set the desired file name
//     document.body.appendChild(link);
//     link.click();

//     // Clean up
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
// }


// Call the function with the API URL
// fetchAndDownloadFile('https://example.com/api/file');
