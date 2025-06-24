import { GoogleGenerativeAI } from '@google/generative-ai';

const getStyleAdvice = async (req, res) => {
    const { question, clothes } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Sual daxil edilməyib.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        // Geyim siyahısının mövcud olub-olmadığını yoxlayırıq
        const hasWardrobe = Array.isArray(clothes) && clothes.length > 0;

        const wardrobeContext = hasWardrobe 
            ? clothes.map(c => `- Adı: "${c.name}", Kateqoriyası: "${c.category}", Mövsümü: "${c.season || 'qeyd edilməyib'}"`).join('\n')
            : "Boşdur"; // Əgər geyim yoxdursa, bunu AI-yə bildiririk
        
        // === YENİLƏNMİŞ, İKİ-SSENARİLİ TƏLİMAT (PROMPT) ===
        const prompt = `
            Sən "StyleFolio" adlı virtual qarderob tətbiqinin peşəkar və kreativ stil məsləhətçisisən.

            QAYDALAR:
            1.  Əvvəlcə aşağıdakı "QARDEROB SİYAHISI"-nı analiz et.
            2.  Sonra istifadəçinin sualını ("${question}") analiz et.
            3.  Bu iki məlumata əsasən aşağıdakı ssenarilərdən BİRİNİ seç və ona uyğun cavab ver:

            -----------------------------------------------------
            **SSENARİ A: Əgər qarderob siyahısı "Boşdur" DEYİLSƏ və istifadəçinin sualına cavab vermək üçün YETƏRLİ VƏ UYĞUN geyimlər varsa:**

            - Cavabını YALNIZ və YALNIZ "QARDEROB SİYAHISI"-ndakı geyimlərə əsaslandır.
            - QƏTİYYƏN siyahıda olmayan bir geyim adı uydurma.
            - Təklif etdiyin hər bir geyimin adını siyahıdakı kimi DƏQİQ qeyd et.
            - Məsələn: "İş görüşməsi üçün qarderobunuzdakı 'Ağ Klassik Köynək' ilə 'Qara Klassik Şalvar'-ı geyinə bilərsiniz."
            -----------------------------------------------------
            **SSENARİ B: Əgər qarderob siyahısı "Boşdur"DURSA və ya suala uyğun geyim YOXDURSA:**

            - Qarderob siyahısını tamamilə nəzərə alma.
            - İstifadəçinin sualına ("${question}") əsaslanaraq, ümumi, dəbə uyğun və kənardan stil məsləhətləri ver.
            - Təklif etdiyin geyimlərin ümumi adlarını çək (məsələn, "klassik bir bej trençkot", "tünd göy cins şalvar", "ağ idman ayaqqabısı").
            - Cavabının sonunda istifadəçini öz geyimlərini qarderoba əlavə etməyə təşviq edən mehriban bir cümlə yaz. Məsələn: "Daha fərdi məsləhətlər üçün öz geyimlərinizi qarderobunuza əlavə etməyi unutmayın!"
            -----------------------------------------------------

            QARDEROB SİYAHISI:
            ${wardrobeContext}

            İSTİFADƏÇİNİN SUALI: "${question}"

            SƏNİN MƏSLƏHƏTİN:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });

    } catch (error) {
        console.error('AI STYLE ADVICE ERROR:', error);
        res.status(500).json({ message: 'Ağıllı məsləhətçi ilə əlaqə qurmaq mümkün olmadı.' });
    }
};

export { getStyleAdvice };
