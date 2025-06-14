const paymentOptions = {
    upi: {
        label: "UPI",
        upiId: "vashudhara@upi",
    },
    phonepe: {
        label: "PhonePe",
        upiId: "vashudhara@ybl",
        upiLink: "upi://pay?pa=vashudhara@ybl&pn=VashudharaStore",
        qr: "https://yourdomain.com/assets/phonepe-qr.png", // ✅ Replace with real QR
    },
    paytm: {
        label: "Paytm",
        upiId: "vashudhara@paytm",
        upiLink: "upi://pay?pa=vashudhara@paytm&pn=VashudharaStore",
        qr: "https://yourdomain.com/assets/paytm-qr.png", // ✅ Replace with real QR
    },
    gpay: {
        label: "Google Pay",
        upiId: "vashudhara@okaxis",
        upiLink: "upi://pay?pa=vashudhara@okaxis&pn=VashudharaStore",
        qr: "https://yourdomain.com/assets/gpay-qr.png", // ✅ Replace with real QR
    },
};

export default paymentOptions;
