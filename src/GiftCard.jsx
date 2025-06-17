import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaGift,
    FaEnvelopeOpenText,
    FaRegCreditCard,
    FaArrowLeft,
    FaCheckCircle,
    FaExclamationCircle,
    FaShoppingBag // <<< Correctly imported FaShoppingBag
} from 'react-icons/fa';

const GiftCard = () => {
    const [sendRecipientEmail, setSendRecipientEmail] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [sendMessage, setSendMessage] = useState('');
    const [sendSuccess, setSendSuccess] = useState(false);
    const [sendError, setSendError] = useState(false);

    const [buyAmount, setBuyAmount] = useState('');
    const [buySuccess, setBuySuccess] = useState(false);
    const [buyError, setBuyError] = useState(false);

    const [redeemCode, setRedeemCode] = useState('');
    const [redeemSuccess, setRedeemSuccess] = useState(false);
    const [redeemError, setRedeemError] = useState(false);
    const [redeemedAmount, setRedeemedAmount] = useState(0);

    // Mock received gift cards
    const [receivedGiftCards, setReceivedGiftCards] = useState([
        { id: 'recv001', code: 'GIFT2023HAPPY', amount: 500, sender: 'Priya Sharma', message: 'Happy Birthday! Enjoy shopping.' },
        { id: 'recv002', code: 'THANKS4ALL1000', amount: 1000, sender: 'Rahul Singh', message: 'A token of my appreciation.' },
    ]);

    const handleSendGiftCard = (e) => {
        e.preventDefault();
        setSendSuccess(false);
        setSendError(false);

        if (!sendRecipientEmail || !sendAmount || isNaN(sendAmount) || parseFloat(sendAmount) <= 0) {
            setSendError(true);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            console.log("Sending Gift Card:", { sendRecipientEmail, sendAmount, sendMessage });
            setSendSuccess(true);
            setSendError(false);
            setSendRecipientEmail('');
            setSendAmount('');
            setSendMessage('');
        }, 1000);
    };

    const handleBuyGiftCard = (e) => {
        e.preventDefault();
        setBuySuccess(false);
        setBuyError(false);

        if (!buyAmount || isNaN(buyAmount) || parseFloat(buyAmount) <= 0) {
            setBuyError(true);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            console.log("Buying Gift Card:", { buyAmount });
            setBuySuccess(true);
            setBuyError(false);
            setBuyAmount('');
            // In a real app, this would lead to a payment gateway
        }, 1000);
    };

    const handleRedeemGiftCard = (e) => {
        e.preventDefault();
        setRedeemSuccess(false);
        setRedeemError(false);
        setRedeemedAmount(0);

        if (!redeemCode.trim()) {
            setRedeemError(true);
            return;
        }

        // Simulate API call to validate code
        setTimeout(() => {
            const foundCard = receivedGiftCards.find(card => card.code === redeemCode.trim());
            if (foundCard) {
                setRedeemedAmount(foundCard.amount);
                setRedeemSuccess(true);
                // In a real app, you'd remove the card from receivedGiftCards
                // and add the amount to user's wallet/credit
            } else {
                setRedeemError(true);
            }
            setRedeemCode('');
        }, 1000);
    };

    return (
        <>
            {/* CSS embedded directly in the component */}
            {/* REMOVED 'jsx' ATTRIBUTE HERE to fix the warning */}
            <style>{`
                /* CSS Variables for consistency */
                :root {
                    --primary-gradient: linear-gradient(90deg, #0f2027, #203a43, #2c5364);
                    --primary-color: #00ffe7; /* Bright cyan/teal */
                    --text-color: #e0e0e0; /* Lighter grey for general text */
                    --accent-bg-color: rgba(0,255,231,0.1); /* Light transparent cyan */
                    --accent-hover-color: #00ccb3; /* Slightly darker primary color on hover */
                    --success-color: #4CAF50; /* Green for success */
                    --error-color: #ff4d4d; /* Red for errors/removals */
                    --button-bg-light: #f0f0f0; /* Light background for buttons */
                    --button-text-dark: #333; /* Dark text for light buttons */
                    --card-bg: #1c2e3a; /* Slightly lighter dark background for cards */
                    --border-color: rgba(0,255,231,0.3); /* Stronger transparent cyan for borders */
                    --shadow-color: rgba(0,0,0,0.6);
                    --light-text-color: #a0a0a0;
                    --input-bg: #283e4a;
                    --input-border: #008f7d;
                }

                .gift-card-container {
                    padding: 20px 15px;
                    max-width: 1200px;
                    margin: 20px auto;
                    font-family: 'Poppins', sans-serif;
                    color: var(--text-color);
                    background-color: #1a1a1a;
                    min-height: calc(100vh - 100px);
                    border-radius: 12px;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.7);
                }

                .gift-card-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--border-color);
                }

                .gift-card-header h1 {
                    font-size: 2.2em;
                    color: var(--primary-color);
                    text-align: center;
                    text-shadow: 0 0 10px var(--primary-color);
                    margin: 0;
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

                .section-grid {
                    display: grid;
                    grid-template-columns: 1fr; /* Single column for mobile */
                    gap: 30px;
                }

                .gift-card-section {
                    background-color: var(--card-bg);
                    border-radius: 12px;
                    padding: 25px 20px;
                    box-shadow: 0 4px 15px var(--shadow-color);
                    border: 1px solid var(--border-color);
                }

                .gift-card-section h2 {
                    font-size: 1.8em;
                    color: var(--primary-color);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-shadow: 0 0 5px rgba(0,255,231,0.3);
                }

                .gift-card-section form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 0.95em;
                    color: var(--text-color);
                }

                .form-group input,
                .form-group textarea {
                    width: calc(100% - 20px); /* Adjust for padding */
                    padding: 12px;
                    border: 1px solid var(--input-border);
                    border-radius: 8px;
                    background-color: var(--input-bg);
                    color: var(--text-color);
                    font-size: 1em;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: var(--primary-color);
                    outline: none;
                    box-shadow: 0 0 8px rgba(0,255,231,0.5);
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .gift-card-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 12px 25px;
                    background-color: var(--primary-color);
                    color: var(--button-text-dark);
                    text-decoration: none;
                    border: none;
                    border-radius: 30px;
                    font-weight: 600;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0,255,231,0.4);
                    width: auto; /* Allow button to size itself */
                    margin-top: 10px;
                }

                .gift-card-button:hover {
                    background-color: var(--accent-hover-color);
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0,255,231,0.6);
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

                .success-message {
                    background-color: rgba(76, 175, 80, 0.2);
                    color: var(--success-color);
                    border: 1px solid var(--success-color);
                }

                .error-message {
                    background-color: rgba(255, 77, 77, 0.2);
                    color: var(--error-color);
                    border: 1px solid var(--error-color);
                }

                .received-cards-list {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .received-card-item {
                    background-color: rgba(0,255,231,0.05); /* Lighter accent for items */
                    border-radius: 8px;
                    padding: 15px;
                    border: 1px solid rgba(0,255,231,0.2);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                .received-card-item h3 {
                    font-size: 1.2em;
                    color: var(--primary-color);
                    margin-bottom: 5px;
                }

                .received-card-item p {
                    font-size: 0.95em;
                    color: var(--light-text-color);
                    margin-bottom: 5px;
                }

                .received-card-item .amount {
                    font-size: 1.1em;
                    font-weight: 600;
                    color: var(--text-color);
                }

                /* Responsive Design */
                @media (min-width: 768px) {
                    .gift-card-container {
                        padding: 30px 25px;
                    }

                    .gift-card-header {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: flex-end;
                    }

                    .gift-card-header h1 {
                        font-size: 2.8em;
                        text-align: left;
                    }

                    .back-to-home {
                        font-size: 1em;
                        align-self: flex-start;
                    }

                    .section-grid {
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Two or more columns */
                    }

                    .gift-card-section {
                        padding: 30px 25px;
                    }

                    .gift-card-section h2 {
                        font-size: 2em;
                    }

                    .form-group input,
                    .form-group textarea {
                        width: calc(100% - 24px); /* Adjust for padding in wider screens */
                    }

                    .gift-card-button {
                        align-self: flex-start; /* Align button to start in wider layouts */
                    }
                }

                @media (min-width: 1024px) {
                    .gift-card-container {
                        padding: 40px 30px;
                    }

                    .gift-card-header h1 {
                        font-size: 3.2em;
                    }

                    .section-grid {
                        grid-template-columns: repeat(3, 1fr); /* Three columns for larger desktops */
                    }

                    .gift-card-section h2 {
                        font-size: 2.2em;
                    }
                }
            `}</style>

            <div className="gift-card-container">
                <div className="gift-card-header">
                    <Link to="/" className="back-to-home" title="Back to Home">
                        <FaArrowLeft />
                        <span>Back to Home</span>
                    </Link>
                    <h1><FaGift /> Gift Cards</h1>
                </div>

                <div className="section-grid">
                    {/* Send Gift Card Section */}
                    <div className="gift-card-section">
                        <h2><FaEnvelopeOpenText /> Send a Gift Card</h2>
                        <form onSubmit={handleSendGiftCard}>
                            <div className="form-group">
                                <label htmlFor="send-email">Recipient Email:</label>
                                <input
                                    type="email"
                                    id="send-email"
                                    value={sendRecipientEmail}
                                    onChange={(e) => setSendRecipientEmail(e.target.value)}
                                    placeholder="recipient@example.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="send-amount">Amount (₹):</label>
                                <input
                                    type="number"
                                    id="send-amount"
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                    placeholder="e.g., 500, 1000"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="send-message">Personal Message (Optional):</label>
                                <textarea
                                    id="send-message"
                                    value={sendMessage}
                                    onChange={(e) => setSendMessage(e.target.value)}
                                    placeholder="Happy Birthday! Enjoy shopping."
                                ></textarea>
                            </div>
                            <button type="submit" className="gift-card-button">
                                Send Gift Card <FaGift />
                            </button>
                            {sendSuccess && <p className="message success-message"><FaCheckCircle /> Gift card sent successfully!</p>}
                            {sendError && <p className="message error-message"><FaExclamationCircle /> Please fill all fields correctly.</p>}
                        </form>
                    </div>

                    {/* Buy Gift Card for Yourself Section */}
                    <div className="gift-card-section">
                        <h2><FaRegCreditCard /> Buy for Myself</h2>
                        <form onSubmit={handleBuyGiftCard}>
                            <div className="form-group">
                                <label htmlFor="buy-amount">Amount (₹):</label>
                                <input
                                    type="number"
                                    id="buy-amount"
                                    value={buyAmount}
                                    onChange={(e) => setBuyAmount(e.target.value)}
                                    placeholder="e.g., 200, 500"
                                    min="1"
                                    required
                                />
                            </div>
                            <button type="submit" className="gift-card-button">
                                Buy Gift Card <FaShoppingBag />
                            </button>
                            {buySuccess && <p className="message success-message"><FaCheckCircle /> Gift card purchased! Check your email.</p>}
                            {buyError && <p className="message error-message"><FaExclamationCircle /> Please enter a valid amount.</p>}
                        </form>
                    </div>

                    {/* Redeem Gift Card Section */}
                    <div className="gift-card-section">
                        <h2><FaGift /> Redeem Gift Card</h2>
                        <form onSubmit={handleRedeemGiftCard}>
                            <div className="form-group">
                                <label htmlFor="redeem-code">Gift Card Code:</label>
                                <input
                                    type="text"
                                    id="redeem-code"
                                    value={redeemCode}
                                    onChange={(e) => setRedeemCode(e.target.value)}
                                    placeholder="Enter your unique code"
                                    required
                                />
                            </div>
                            <button type="submit" className="gift-card-button">
                                Redeem Code <FaCheckCircle />
                            </button>
                            {redeemSuccess && <p className="message success-message"><FaCheckCircle /> Successfully redeemed ₹{redeemedAmount.toLocaleString()}!</p>}
                            {redeemError && <p className="message error-message"><FaExclamationCircle /> Invalid or already redeemed code.</p>}
                        </form>
                    </div>

                    {/* Received Gift Cards Section */}
                    <div className="gift-card-section full-width-section"> {/* Add class to make this full width on larger screens if needed */}
                        <h2><FaEnvelopeOpenText /> Received Gift Cards</h2>
                        {receivedGiftCards.length === 0 ? (
                            <p className="message error-message">No gift cards received yet.</p>
                        ) : (
                            <div className="received-cards-list">
                                {receivedGiftCards.map((card) => (
                                    <div key={card.id} className="received-card-item">
                                        <h3>From: {card.sender}</h3>
                                        <p>Message: {card.message}</p>
                                        <p className="amount">Amount: ₹{card.amount.toLocaleString()}</p>
                                        <p>Code: <strong>{card.code}</strong></p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GiftCard;