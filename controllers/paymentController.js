    import Stripe from 'stripe';
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    const createPaymentIntent = async (req, res) => {
        const { amount } = req.body; 
        const amountInCents = Math.round(amount * 100);
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'azn', 
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
    