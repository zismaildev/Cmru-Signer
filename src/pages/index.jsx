import Head from 'next/head'
import React from 'react'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Digital CMRU</title>
        <meta name="description" content="ระบบลงนามเอกสารออนไลน์ สำนักดิจิทัล มหาวิทยาลัยราชภัฏเชียงใหม่" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">ยินดีต้อนรับ</h2>
      </div>
    </div>
  )
}