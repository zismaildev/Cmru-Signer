import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Avatar } from '@heroui/react';
import Head from 'next/head';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Form,
    Input,
} from "@heroui/react";

export default function Profile() {
    const { data: session } = useSession();
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [signature, setSignature] = useState(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [submitted, setSubmitted] = useState(null);

    const handleSignatureUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setSignature(reader.result);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!session) {
            alert("Session not found. Please log in again.");
            return;
        }

        console.log("Session:", session);
        console.log("Form Data:", { firstName, lastName, role, signature, email: session.user.email });

        const response = await fetch("/api/updateProfile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
                firstName,
                lastName,
                role,
                signature,
                email: session.user.email,
            }),
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log("Updated Data:", responseData.data); // Debugging: Log the updated data

            // Update the state with the returned data
            setFirstName(responseData.data.firstname);
            setLastName(responseData.data.lastname);
            setRole(responseData.data.role);
            setSignature(responseData.data.signature);

            setSubmitted(true);
            alert("Profile updated successfully");
        } else {
            const errorData = await response.json();
            console.error("Error:", errorData);
            alert("Failed to update profile");
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
                {session ? (
                    <div>
                        <div className="mt-8 p-4 text-center">
                            <div className="mt-5 grid grid-cols-1 gap-4 p-5 sm:grid-cols-1 md:grid-cols-2">
                                <div>
                                    <Avatar
                                        className="w-50 h-50 text-large transition-transform"
                                        isBordered
                                        name={session.user.name}
                                        src={session.user.image}
                                    />
                                </div>
                                <div className="mt-3 md:text-right">
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-800">
                                        สวัสดีคุณ
                                    </h2>
                                    <h4 className="mb-8 text-xl tracking-tight text-gray-600">
                                        {session.user.name}
                                    </h4>
                                </div>
                            </div>
                            <h2 className="sm:text-1xl text-left text-2xl font-bold tracking-tight text-gray-800">
                                ชื่อ - นามสกุล
                            </h2>
                            <h4 className="mb-8 text-left text-xl tracking-tight text-gray-600">
                                {session.user.firstname} {session.user.lastname}
                            </h4>
                            <h2 className="sm:text-1xl text-left text-2xl font-bold tracking-tight text-gray-800">
                                อีเมล
                            </h2>
                            <h4 className="mb-8 text-left text-xl tracking-tight text-gray-600">
                                {session.user.email}
                            </h4>
                            <h2 className="sm:text-1xl text-left text-2xl font-bold tracking-tight text-gray-800">
                                ตำแหน่ง
                            </h2>
                            <h4 className="mb-8 text-left text-xl tracking-tight text-gray-600">
                                {session.user.role}
                            </h4>
                        </div>
                        <Button onPress={onOpen}>แก้ไขข้อมูล</Button>
                        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                            <ModalContent>
                                {(onClose) => (
                                    <div className='text-gray-800'>
                                        <ModalHeader className="flex flex-col gap-1">แก้ไขข้อมูลส่วนตัว</ModalHeader>
                                        <ModalBody>
                                            <Form className="w-full max-w-xs" onSubmit={handleSubmit}>
                                                <Input
                                                    label="First Name"
                                                    labelPlacement="outside"
                                                    name="firstName"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    type="text"
                                                />
                                                <Input
                                                    label="Last Name"
                                                    labelPlacement="outside"
                                                    name="lastName"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    type="text"
                                                />
                                                <Input
                                                    label="Role"
                                                    labelPlacement="outside"
                                                    name="role"
                                                    value={role}
                                                    onChange={(e) => setRole(e.target.value)}
                                                    type="text"
                                                />
                                                <Input
                                                    label="Signature"
                                                    labelPlacement="outside"
                                                    name="signature"
                                                    type="file"
                                                    onChange={handleSignatureUpload}
                                                />
                                                <Button type="submit" variant="bordered">
                                                    ยืนยัน
                                                </Button>
                                                {submitted && (
                                                    <div className="text-small text-default-500">
                                                        You submitted: <code>{JSON.stringify(submitted)}</code>
                                                    </div>
                                                )}
                                            </Form>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="danger" variant="light" onPress={onClose}>
                                                ยกเลิก
                                            </Button>
                                        </ModalFooter>
                                    </div>
                                )}
                            </ModalContent>
                        </Modal>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
}
