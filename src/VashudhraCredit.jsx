import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import {
    FaCreditCard,
    FaMoneyBillWave,
    FaGift,
    FaArrowLeft,
    FaBolt,
    FaExchangeAlt,
    FaLayerGroup,
    FaQuestionCircle,
    FaCheckCircle,
    FaTimesCircle
} from "react-icons/fa"; // Import more icons

const VashudhraCredit = () => {
    const [balance, setBalance] = useState(1500.00); // Initial balance for demo
    const [topUpAmount, setTopUpAmount] = useState('');
    const [giftCardCode, setGiftCardCode] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' }); // For success/error messages

    const handleTopUp = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' }); // Clear previous messages
        const amount = parseFloat(topUpAmount);

        if (isNaN(amount) || amount <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid amount to top up.' });
            return;
        }

        // Simulate API call for top-up
        setTimeout(() => {
            setBalance((prev) => prev + amount);
            setMessage({ type: 'success', text: `₹${amount.toLocaleString('en-IN')} added to your Vashudhra Credit!` });
            setTopUpAmount('');
        }, 800);
    };

    const handleAddGiftCard = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' }); // Clear previous messages

        if (!giftCardCode.trim()) {
            setMessage({ type: 'error', text: 'Please enter a Gift Card code.' });
            return;
        }

        // Simulate API call to validate and redeem gift card
        setTimeout(() => {
            if (giftCardCode.trim().toLowerCase() === "vasgc200") { // Example valid code
                const giftCardValue = 200;
                setBalance((prev) => prev + giftCardValue);
                setMessage({ type: 'success', text: `Gift Card "${giftCardCode}" redeemed! ₹${giftCardValue.toLocaleString('en-IN')} added.` });
                setGiftCardCode('');
            } else {
                setMessage({ type: 'error', text: `Invalid or already used Gift Card code: "${giftCardCode}".` });
            }
        }, 800);
    };

    return (
        <>
            {/* CSS embedded directly in the component */}
            <style>{`
                /* CSS Variables for consistency */
                :root {
                    --primary-gradient: linear-gradient(90deg, #0f2027, #203a43, #2c5364);
                    --primary-color: #00ffe7; /* Bright cyan/teal */
                    --text-color: #e0e0e0; /* Lighter grey for general text */
                    --accent-bg-color: rgba(0,255,231,0.1); /* Light transparent cyan */
                    --accent-hover-color: #00ccb3; /* Slightly darker primary color on hover */
                    --success-color: #4CAF50; /* Green for success */
                    --error-color: #ff4d4d; /* Red for errors */
                    --button-bg-light: #f0f0f0; /* Light background for buttons */
                    --button-text-dark: #333; /* Dark text for light buttons */
                    --card-bg: #1c2e3a; /* Slightly lighter dark background for cards */
                    --border-color: rgba(0,255,231,0.3); /* Stronger transparent cyan for borders */
                    --shadow-color: rgba(0,0,0,0.6);
                    --light-text-color: #a0a0a0;
                    --input-bg: #283e4a;
                    --input-border: #008f7d;
                    --info-color: #5bc0de;
                }

                .vashudhra-credit-container {
                    padding: 20px 15px;
                    max-width: 1000px;
                    margin: 20px auto;
                    font-family: 'Poppins', sans-serif;
                    color: var(--text-color);
                    background-color: #1a1a1a;
                    min-height: calc(100vh - 80px); /* Adjust based on header/footer */
                    border-radius: 12px;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.7);
                    border: 1px solid var(--border-color);
                    overflow-x: hidden; /* Prevent horizontal scroll */
                }

                .vc-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--border-color);
                }

                .vc-header h1 {
                    font-size: 2.5em;
                    color: var(--primary-color);
                    text-align: center;
                    text-shadow: 0 0 10px var(--primary-color);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .back-to-home {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    color: var(--light-text-color);
                    font-size: 0.9em;
                    transition: color 0.2s ease, transform 0.2s ease;
                    align-self: flex-start;
                }

                .back-to-home:hover {
                    color: var(--primary-color);
                    transform: translateX(-5px);
                }

                .current-balance-card {
                    background: var(--primary-gradient);
                    padding: 25px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                    text-align: center;
                    box-shadow: 0 8px 20px rgba(0,255,231,0.3);
                    color: #fff;
                    position: relative;
                    overflow: hidden;
                }

                .current-balance-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle at center, rgba(255,255,255,0.05), transparent 70%);
                    animation: rotate 15s linear infinite;
                    opacity: 0.8;
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .balance-label {
                    font-size: 1.1em;
                    margin-bottom: 8px;
                    opacity: 0.8;
                }

                .balance-amount {
                    font-size: 3.5em;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 0 15px rgba(0,255,231,0.7);
                    animation: pulse 1.5s infinite alternate;
                }

                @keyframes pulse {
                    from { transform: scale(1); }
                    to { transform: scale(1.02); }
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr; /* Single column for mobile */
                    gap: 25px;
                    margin-bottom: 30px;
                }

                .info-card {
                    background-color: var(--card-bg);
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.4);
                    border: 1px solid rgba(0,255,231,0.2);
                    text-align: center;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .info-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0,255,231,0.3);
                }

                .info-card .icon {
                    font-size: 2.5em;
                    color: var(--primary-color);
                    margin-bottom: 10px;
                }

                .info-card h3 {
                    font-size: 1.4em;
                    color: var(--primary-color);
                    margin-bottom: 10px;
                }

                .info-card p {
                    font-size: 0.95em;
                    color: var(--light-text-color);
                    line-height: 1.5;
                }

                .action-forms-grid {
                    display: grid;
                    grid-template-columns: 1fr; /* Single column for mobile */
                    gap: 30px;
                    margin-bottom: 40px;
                }

                .action-form-card {
                    background-color: var(--card-bg);
                    border-radius: 12px;
                    padding: 25px 20px;
                    box-shadow: 0 4px 15px var(--shadow-color);
                    border: 1px solid var(--border-color);
                }

                .action-form-card h2 {
                    font-size: 1.8em;
                    color: var(--primary-color);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .action-form-card form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .form-group {
                    margin-bottom: 10px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 0.95em;
                    color: var(--text-color);
                }

                .form-group input {
                    width: calc(100% - 24px); /* Adjust for padding and border */
                    padding: 12px;
                    border: 1px solid var(--input-border);
                    border-radius: 8px;
                    background-color: var(--input-bg);
                    color: var(--text-color);
                    font-size: 1em;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }

                .form-group input:focus {
                    border-color: var(--primary-color);
                    outline: none;
                    box-shadow: 0 0 8px rgba(0,255,231,0.5);
                }

                .primary-button,
                .secondary-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 12px 25px;
                    border-radius: 30px;
                    font-weight: 600;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    white-space: nowrap;
                    width: fit-content; /* Adjust width to content */
                }

                .primary-button {
                    background-color: var(--primary-color);
                    color: var(--button-text-dark);
                    border: none;
                    box-shadow: 0 4px 15px rgba(0,255,231,0.4);
                }

                .primary-button:hover {
                    background-color: var(--accent-hover-color);
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0,255,231,0.6);
                }

                .secondary-button {
                    background-color: transparent;
                    color: var(--primary-color);
                    border: 1px solid var(--primary-color);
                    box-shadow: none;
                }

                .secondary-button:hover {
                    background-color: rgba(0,255,231,0.1);
                    transform: translateY(-3px);
                    box-shadow: 0 4px 10px rgba(0,255,231,0.2);
                }

                .message {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 15px;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-weight: 500;
                }

                .message.success {
                    background-color: rgba(76, 175, 80, 0.2);
                    color: var(--success-color);
                    border: 1px solid var(--success-color);
                }

                .message.error {
                    background-color: rgba(255, 77, 77, 0.2);
                    color: var(--error-color);
                    border: 1px solid var(--error-color);
                }

                .terms-section {
                    margin-top: 40px;
                    font-size: 0.9em;
                    color: var(--light-text-color);
                    padding-top: 20px;
                    border-top: 1px dashed rgba(255,255,255,0.05);
                }

                .terms-section h4 {
                    font-size: 1.2em;
                    color: var(--text-color);
                    margin-bottom: 15px;
                }

                .terms-section ul {
                    list-style: none; /* Remove default bullets */
                    padding: 0;
                    margin: 0;
                }

                .terms-section ul li {
                    margin-bottom: 8px;
                    padding-left: 20px;
                    position: relative;
                    color: var(--light-text-color);
                }

                .terms-section ul li::before {
                    content: '•'; /* Custom bullet point */
                    color: var(--primary-color);
                    position: absolute;
                    left: 0;
                    font-size: 1.2em;
                    line-height: 1;
                }

                .terms-links {
                    margin-top: 20px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    justify-content: center;
                }

                .terms-links a {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s ease, transform 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .terms-links a:hover {
                    color: var(--accent-hover-color);
                    transform: translateY(-2px);
                }


                /* Responsive Layouts */
                @media (min-width: 768px) {
                    .vashudhra-credit-container {
                        padding: 30px 25px;
                    }

                    .vc-header {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: flex-end;
                    }

                    .vc-header h1 {
                        font-size: 3em;
                        text-align: left;
                    }

                    .back-to-home {
                        font-size: 1em;
                        align-self: flex-start;
                    }

                    .info-grid {
                        grid-template-columns: repeat(2, 1fr); /* Two columns for tablets */
                    }

                    .action-forms-grid {
                        grid-template-columns: repeat(2, 1fr); /* Two columns for forms */
                    }

                    .primary-button,
                    .secondary-button {
                        width: auto; /* Buttons adjust naturally */
                    }
                }

                @media (min-width: 1024px) {
                    .vashudhra-credit-container {
                        padding: 40px 30px;
                    }

                    .vc-header h1 {
                        font-size: 3.5em;
                    }

                    .info-grid {
                        grid-template-columns: repeat(4, 1fr); /* Four columns for desktops */
                    }
                     .action-forms-grid {
                        grid-template-columns: repeat(2, 1fr); /* Still two columns, but wider */
                    }
                }
            `}</style>

            <div className="vashudhra-credit-container">
                <div className="vc-header">
                    {/* Link to dashboard or another appropriate parent page */}
                    <Link to="/dashboard" className="back-to-home" title="Back to Dashboard">
                        <FaArrowLeft />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1><FaCreditCard /> Vashudhra Credit</h1>
                </div>

                {/* Current Balance Card */}
                <div className="current-balance-card">
                    <p className="balance-label">Your Current Balance</p>
                    <div className="balance-amount">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>

                {/* Benefits Section */}
                <div className="info-grid">
                    <div className="info-card">
                        <FaBolt className="icon" />
                        <h3>Instant Checkout</h3>
                        <p>One-click, easy, and fast checkout for a seamless shopping experience.</p>
                    </div>
                    <div className="info-card">
                        <FaExchangeAlt className="icon" />
                        <h3>Faster Refunds</h3>
                        <p>Get instant refunds as Vashudhra Credit, no waiting for bank transfers.</p>
                    </div>
                    <div className="info-card">
                        <FaLayerGroup className="icon" />
                        <h3>Consolidated Money</h3>
                        <p>All your gift cards, refunds, and cashbacks in one convenient place.</p>
                    </div>
                    <div className="info-card">
                        <FaQuestionCircle className="icon" />
                        <h3>Exclusive Benefits</h3>
                        <p>Unlock special offers, discounts, and rewards when using Vashudhra Credit.</p>
                    </div>
                </div>

                {/* Action Forms Section */}
                <div className="action-forms-grid">
                    {/* Top Up Form */}
                    <div className="action-form-card">
                        <h2><FaMoneyBillWave /> Top Up Credit</h2>
                        <form onSubmit={handleTopUp}>
                            <div className="form-group">
                                <label htmlFor="top-up-amount">Amount (₹):</label>
                                <input
                                    type="number"
                                    id="top-up-amount"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    placeholder="e.g., 500, 1000"
                                    min="1"
                                    step="0.01" // Allow decimal amounts
                                    required
                                />
                            </div>
                            <button type="submit" className="primary-button">
                                Top Up Now <FaCreditCard />
                            </button>
                        </form>
                    </div>

                    {/* Add Gift Card Form */}
                    <div className="action-form-card">
                        <h2><FaGift /> Add Gift Card</h2>
                        <form onSubmit={handleAddGiftCard}>
                            <div className="form-group">
                                <label htmlFor="gift-card-code">Gift Card Code:</label>
                                <input
                                    type="text"
                                    id="gift-card-code"
                                    value={giftCardCode}
                                    onChange={(e) => setGiftCardCode(e.target.value)}
                                    placeholder="Enter your gift card code"
                                    required
                                />
                            </div>
                            <button type="submit" className="secondary-button">
                                Redeem Gift Card <FaGift />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Message display */}
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                        {message.text}
                    </div>
                )}


                {/* Terms and Conditions Section */}
                <div className="terms-section">
                    <h4>Important Information</h4>
                    <ul>
                        <li>Vashudhra Credit cannot be cancelled or transferred to another account.</li>
                        <li>It cannot be withdrawn as cash or transferred to any bank account.</li>
                        <li>It cannot be used to purchase Gift Cards.</li>
                        <li>Net-banking and credit/debit cards issued in India can be used for Vashudhra Credit top-up.</li>
                        <li>Credits have an expiry. Please refer to our FAQs for more details.</li>
                    </ul>
                    <div className="terms-links">
                        <a href="#" target="_blank" rel="noopener noreferrer">Vashudhra Credit T&amp;C &gt;</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">Gift Card T&amp;C &gt;</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">FAQs &gt;</a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VashudhraCredit;