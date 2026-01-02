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
    } catch (e) { res.status(500).send("Erro"); }
});

app.get('/api/info/:user', async (req, res) => {
    const user = req.params.user;
    console.log("Buscando usuário:", user);

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
        
        // A MUDANÇA ESTÁ AQUI: Tentando dois caminhos diferentes para achar os dados
        const u = response.data.data || response.data; 

        if (!u || (!u.full_name && !u.username)) {
            return res.status(404).json({ erro: "Dados não encontrados na resposta" });
        }

        res.json({
            nome: u.full_name || u.username || "Sem nome",
            bio: u.biography || "Sem biografia",
            seguidores: u.follower_count || 0,
            foto: u.profile_pic_url_hd ? `/api/proxy-image?url=${encodeURIComponent(u.profile_pic_url_hd)}` : ""
        });
    } catch (error) {
        res.status(500).json({ erro: "Erro na API do RapidAPI" });
    }
});

module.exports = app;
