import prisma from '@/lib/prisma_client';
import React from 'react';

async function page(ctx) {

  const filePath = ctx.searchParams?.path || '';

  const fileSplit = filePath.split('.');
  const fileExt = fileSplit.pop()

  return (
    <div style={{ width: "100vh", margin: "0 auto" }}>
      {/* <div style={{ width: `${fileExt === "pdf" ? "100vh" : ""}`, margin: "auto" }}> */}

      {/* // // <div className=' container mx-auto bg-sky-500 m-auto min-h-screen'> */}
      {/* <iframe src={`${process.env.SERVER_HOST}/api/get_file/${filePath?.replace(/\\/g, '/')}`}
      //   width="100%"
      //   height="100vh"
      // //   style={{minHeight:"100%"}}
      // />
      // <embed src={`${process.env.SERVER_HOST}/api/get_file/${filePath?.replace(/\\/g, '/')}`}
      //   width="100%"
      //   height="100%"
      // // style={{minHeight:"100%"}}
      // /> */}
      <object
        data={`${process.env.SERVER_HOST}/api/get_file/${filePath?.replace(/\\/g, '/')}`}
        style={{ height: '96vh', minWidth: `${fileExt === "pdf" ? "100vh" : ""}`, padding: "10px", background: "lightgray" }}
      />

    </div>
  )
}

export default page