const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/proxy-image', async (req, res) => {
    try {
        const url = req.query.url;
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (e) { res.status(500).send("Erro na imagem"); }
});

app.get('/api/info/:user', async (req, res) => {
    const user = req.params.user;
    
    const options = {
        method: 'GET',
        url: 'https://instagram-scraper-stable-api.p.rapidapi.com/get_user_info.php',
        params: { user: user },
        headers: {
            'x-rapidapi-key': '8a26345eb0mshbe9bae691b6a372p1ab908jsn48161e5ec2b8',
            'x-rapidapi-host': 'instagram-scraper-stable-api.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data); // Isso ajuda a ver o erro no painel da Vercel

        // AQUI ESTÁ A MUDANÇA: Pegando os dados de qualquer jeito que vierem
        const data = response.data;

        // Se a API retornar erro ou não vier nada
        if (!data) return res.status(404).json({ erro: "API vazia" });

        res.json({
            nome: data.full_name || data.username || "Não encontrado",
            bio: data.biography || "Sem biografia",
            seguidores: data.follower_count || data.followers || 0,
            foto: data.profile_pic_url_hd ? `/api/proxy-image?url=${encodeURIComponent(data.profile_pic_url_hd)}` : ""
        });

    } catch (error) {
        res.status(500).json({ erro: "Erro de conexão" });
    }
});

module.exports = app;
