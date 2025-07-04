import axios from 'axios';
import * as cheerio from 'cheerio';

const fetchProductData = async (req, res) => {
    const { productUrl } = req.body;

    if (!productUrl) {
        return res.status(400).json({ message: 'Məhsul linki göndərilməyib.' });
    }

    try {
        const { data } = await axios.get(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        const name = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim();
        const image = $('meta[property="og:image"]').attr('content') || $('article.product_page .carousel-inner img').attr('src');
        
        let price = $('meta[property="product:price:amount"]').attr('content');
        if (!price) {
            price = $('.product_main .price_color').text().trim().replace('£', ''); 
        }
        
  
        let finalImage = image;
        if (image && !image.startsWith('http')) {
            try {
                
                finalImage = new URL(image, productUrl).href;
            } catch (e) {
                
                const url = new URL(productUrl);
                finalImage = `${url.protocol}//${url.hostname}${image}`;
            }
        }

        res.json({
            name: name || '',
            image: finalImage || '',
            price: price || '',
            productUrl: productUrl
        });

    } catch (error) {
        console.error('Scraping error:', error.message);
        res.status(500).json({ message: 'Linkdən məlumatları çıxarmaq mümkün olmadı. Sayt qorunmuş ola bilər.' });
    }
};

export { fetchProductData };
