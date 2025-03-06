import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";

export default function SignIn({ providers }) {
    return (
        <div>
            <Head>
                <title>Digital CMRU</title>
                <meta name="description" content="ระบบลงนามเอกสารออนไลน์ สำนักดิจิทัล มหาวิทยาลัยราชภัฏเชียงใหม่ หน้าลงชื่อเข้าใช้งาน" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-900">Sign In</h2>
                {providers && Object.values(providers).map((provider) => (
                    <div key={provider.name} className="text-center mt-4">
                        <button
                            onClick={() => signIn(provider.id)}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                        >
                            Sign in with {provider.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export async function getServerSideProps() {
    const providers = await getProviders();
    if (!providers) {
        return {
            notFound: true,
        };
    }
    return {
        props: { providers },
    };
}
