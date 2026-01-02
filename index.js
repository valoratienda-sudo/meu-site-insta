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
    const usuarioInstagram = req.params.user;

    const options = {
        method: 'GET',
        url: 'https://instagram-scraper-stable-api.p.rapidapi.com/get_user_info.php',
        params: { user: usuarioInstagram }, // <--- O NOME DO USUÁRIO VAI AQUI
        headers: {
            'x-rapidapi-key': '8a26345eb0mshbe9bae691b6a372p1ab908jsn48161e5ec2b8',
            'x-rapidapi-host': 'instagram-scraper-stable-api.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        
        // Vamos pegar os dados de forma super protegida
        const info = response.data;

        // Se a API não devolver nada com nome ou username, ela falhou
        if (!info || (!info.full_name && !info.username)) {
            return res.status(404).json({ erro: "A API não encontrou esse @ no Instagram." });
        }

        res.json({
            nome: info.full_name || info.username || "Perfil",
            bio: info.biography || "Sem biografia",
            seguidores: info.follower_count || 0,
            foto: info.profile_pic_url_hd ? `/api/proxy-image?url=${encodeURIComponent(info.profile_pic_url_hd)}` : ""
        });

    } catch (error) {
        // Se der erro de conexão ou de Key
        res.status(500).json({ erro: "Erro na conexão com o servidor da API." });
    }
});

module.exports = app;
