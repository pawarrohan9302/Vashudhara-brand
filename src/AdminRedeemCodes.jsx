import React, { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, onValue, set, remove } from "firebase/database";

const AdminRedeemCodes = () => {
    const [redeemCodes, setRedeemCodes] = useState({});
    const [message, setMessage] = useState("");

    useEffect(() => {
        const codesRef = ref(database, "redeemCodes");
        onValue(codesRef, (snapshot) => {
            const data = snapshot.val() || {};
            setRedeemCodes(data);
        });
    }, []);

    // 6-char random uppercase alphanumeric code generator
    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleGenerateCode = () => {
        const code = generateCode();
        const codeRef = ref(database, `redeemCodes/${code}`);

        // Check if code already exists — regenerate if yes
        if (redeemCodes[code]) {
            setMessage("Collision! Trying again...");
            setTimeout(() => {
                handleGenerateCode();
            }, 100);
            return;
        }

        set(codeRef, {
            redeemed: false,
            createdAt: Date.now(),
        })
            .then(() => {
                setMessage(`Redeem code "${code}" generated successfully!`);
            })
            .catch(() => {
                setMessage("Failed to generate redeem code. Try again.");
            });
    };

    const handleDeleteCode = (code) => {
        if (!window.confirm(`Are you sure you want to delete code "${code}"?`)) return;

        const codeRef = ref(database, `redeemCodes/${code}`);
        remove(codeRef)
            .then(() => {
                setMessage(`Redeem code "${code}" deleted.`);
            })
            .catch(() => {
                setMessage("Failed to delete code.");
            });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Redeem Codes</h2>

            <button
                onClick={handleGenerateCode}
                className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
                Generate Redeem Code
            </button>

            {message && <p className="mb-4 text-green-600">{message}</p>}

            <div className="overflow-auto max-h-96 border rounded p-2 bg-white">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">Code</th>
                            <th className="border px-2 py-1">Redeemed</th>
                            <th className="border px-2 py-1">Created At</th>
                            <th className="border px-2 py-1">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(redeemCodes).map(([code, info]) => (
                            <tr key={code} className={info.redeemed ? "bg-gray-300" : ""}>
                                <td className="border px-2 py-1 font-mono">{code}</td>
                                <td className="border px-2 py-1">
                                    {info.redeemed ? "Yes" : "No"}
                                </td>
                                <td className="border px-2 py-1">
                                    {new Date(info.createdAt).toLocaleString()}
                                </td>
                                <td className="border px-2 py-1">
                                    <button
                                        onClick={() => handleDeleteCode(code)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {Object.keys(redeemCodes).length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-4 text-gray-500">
                                    No redeem codes generated yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRedeemCodes;
