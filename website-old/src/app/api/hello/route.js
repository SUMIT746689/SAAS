import axios from "axios";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(request) {
  try {
  console.log({ params: request.nextUrl.searchParams, sssss: process.env.FILESFOLDER, ppp: process.cwd() })
  // https://admin.edu360.com.bd/api/get_file/frontendPhoto/1699525191193_Screenshot%20from%202023-11-08%2015-26-25.png

  const updateFilePath = path.join(process.cwd(), '..', 'AllFiles', 'frontendPhoto/1699525191193_Screenshot from 2023-11-08 15-26-25.png');
  const aaa = new NextResponse()

  console.log({ updateFilePath, aaa })
  const newHeaders = new Headers(request.headers)
  // Add a new header

  // newHeaders.set("Transfer-Encoding", "chunked")
  newHeaders.set("Content-Type", "image/png")

  // And produce a response with the new headers


  // const response = new Response()
  // console.log({ response: response })
  // console.log({ geo: request.geo.city })
  // return response
  // const { file_path } = request.query || {};
  // const updateFilePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, ...file_path);
  console.log(fs.existsSync(updateFilePath))
  if (!fs.existsSync(updateFilePath)) return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })

  let bufferArr = ''
  const readStream = fs.createReadStream(updateFilePath, "base64")
  readStream.on("data", (res) => {
    // console.log({ res });
    // bufferArr.push(res)
    bufferArr = bufferArr + res
    // aaa.arrayBuffer(res)
  })
  readStream.on("end", () => {
    // console.log({bufferArr: Buffer.concat(bufferArr)})
    // return aaa.body(Buffer.concat(bufferArr))
    console.log({ bufferArr })
    return new Response({ res: "ddddd" }, { headers: newHeaders })
    return NextResponse.json({ data: bufferArr })
    return new Response({ data: bufferArr }, { headers: newHeaders })

  })

  // return NextResponse
}
catch(err){
  console.log({err})
  return new NextResponse("success")
}
}
