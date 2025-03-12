import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Profile() {
    const { data: session } = useSession();
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [signature, setSignature] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch(`/api/profile?email=${session.user.email}`);
            if (response.ok) {
                const data = await response.json();
                setFirstName(data.firstName || '');
                setLastName(data.lastName || '');
                setRole(data.role || '');
                setSignature(data.signature || null);
            }
        };

        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handleSignatureUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setSignature(reader.result);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: session.user.email,
                firstName,
                lastName,
                role,
                signature,
            }),
        });

        if (response.ok) {
            router.push('/auth/profile'); // Updated path
        } else {
            console.error('Failed to update profile');
        }
    };

    return (
        <div>
            <Head>
                <title>Digital CMRU</title>
                <meta name="description" content="ระบบลงนามเอกสารออนไลน์ สำนักดิจิทัล มหาวิทยาลัยราชภัฏเชียงใหม่" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-900">Profile</h2>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Signature</label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleSignatureUpload}
                            className="mt-1 block w-full"
                        />
                        {signature && <img src={signature} alt="Signature" className="mt-2 w-32 h-auto" />}
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                    >
                        Save Profile
                    </button>
                </form>
            </div>
        </div>
    );
}
