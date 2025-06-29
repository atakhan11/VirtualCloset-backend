    import Stripe from 'stripe';

    // .env faylından gizli açarı götürürük
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // @desc    Yeni bir ödəniş niyyəti (Payment Intent) yarat
    // @route   POST /api/payments/create-payment-intent
    // @access  Private
    const createPaymentIntent = async (req, res) => {
        const { amount } = req.body; // Frontend-dən gələn məbləğ (AZN ilə)
    
        // Məbləği Stripe-ın başa düşdüyü formata (qəpik) çeviririk
        const amountInCents = Math.round(amount * 100);
    
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'azn', // Valyuta
                automatic_payment_methods: {
                    enabled: true,
                },
            });
    
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
    
        } catch (error) {
            console.error("Stripe Error:", error.message);
            res.status(500).json({ message: "Ödəniş prosesini başlatmaq mümkün olmadı", error: error.message });
        }
    };
    
    export { createPaymentIntent };
    